import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AI Meeting Notes Summarizer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
try:
    # Add SSL parameters for Atlas connections
    if "mongodb+srv" in MONGO_URL or ".mongodb.net" in MONGO_URL:
        # Use TLS/SSL settings for MongoDB Atlas
        client = AsyncIOMotorClient(
            MONGO_URL,
            serverSelectionTimeoutMS=5000,
            tls=True,
            tlsAllowInvalidCertificates=True  # Disable certificate verification
        )
    else:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    
    # Validate connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
    db = client.meeting_notes
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    # Continue execution as the connection might be established later
    # Use connection string directly with TLS parameters for Atlas
    if "mongodb+srv" in MONGO_URL or ".mongodb.net" in MONGO_URL:
        client = AsyncIOMotorClient(
            MONGO_URL,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
    else:
        client = AsyncIOMotorClient(MONGO_URL)
    
    db = client.meeting_notes

# Environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Add startup event to create indexes
@app.on_event("startup")
async def create_indexes():
    try:
        # Create indexes for better query performance
        await db.transcripts.create_index("id", unique=True)
        await db.transcripts.create_index("created_at")
        await db.email_logs.create_index("transcript_id")
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating database indexes: {e}")

# Pydantic models
class TranscriptCreate(BaseModel):
    title: str
    original_text: str
    custom_prompt: Optional[str] = "Summarize this meeting transcript in a clear, structured format with key points and action items."

class TranscriptUpdate(BaseModel):
    edited_summary: str

class EmailRequest(BaseModel):
    recipients: List[EmailStr]
    subject: Optional[str] = "Meeting Summary"

class TranscriptResponse(BaseModel):
    id: str
    title: str
    original_text: str
    custom_prompt: str
    generated_summary: Optional[str] = None
    edited_summary: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Gemini integration using Google's official API
async def generate_summary_with_gemini(text: str, prompt: str) -> str:
    """Generate summary using Google's Gemini API"""
    try:
        import google.generativeai as genai
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Create the prompt
        full_prompt = f"Please follow this instruction: '{prompt}'\n\nHere is the meeting transcript to summarize:\n\n{text}"
        
        # Generate response
        response = model.generate_content(full_prompt)
        return response.text
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

# Gmail SMTP configuration
GMAIL_USER = os.getenv("Email")
GMAIL_PASSWORD = os.getenv("Pass")
GMAIL_SMTP_SERVER = "smtp.gmail.com"
GMAIL_SMTP_PORT = 587

def send_email_smtp(recipients, subject, message_text):
    """Send email using Gmail SMTP"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(message_text, 'plain'))
        
        # Create SMTP session
        server = smtplib.SMTP(GMAIL_SMTP_SERVER, GMAIL_SMTP_PORT)
        server.starttls()  # Enable TLS
        
        # Login to Gmail
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(GMAIL_USER, recipients, text)
        
        # Close connection
        server.quit()
        
        return True
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email via SMTP: {str(e)}")

# API Routes
@app.get("/")
async def root():
    return {"message": "AI Meeting Notes Summarizer API"}

@app.post("/api/transcripts", response_model=TranscriptResponse)
async def create_transcript(transcript: TranscriptCreate):
    """Create a new transcript"""
    transcript_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    transcript_doc = {
        "id": transcript_id,
        "title": transcript.title,
        "original_text": transcript.original_text,
        "custom_prompt": transcript.custom_prompt,
        "generated_summary": None,
        "edited_summary": None,
        "created_at": now,
        "updated_at": None
    }
    
    try:
        await db.transcripts.insert_one(transcript_doc)
        return TranscriptResponse(**transcript_doc)
    except Exception as e:
        print(f"Error creating transcript: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/transcripts")
async def get_transcripts():
    """Get all transcripts"""
    try:
        transcripts = []
        async for doc in db.transcripts.find().sort("created_at", -1):
            transcripts.append(TranscriptResponse(**doc))
        return {"transcripts": transcripts}
    except Exception as e:
        print(f"Error fetching transcripts: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/transcripts/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript(transcript_id: str):
    """Get a specific transcript"""
    try:
        transcript = await db.transcripts.find_one({"id": transcript_id})
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        return TranscriptResponse(**transcript)
    except Exception as e:
        print(f"Error fetching transcript {transcript_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/transcripts/{transcript_id}/generate-summary")
async def generate_summary(transcript_id: str):
    """Generate AI summary for a transcript"""
    try:
        transcript = await db.transcripts.find_one({"id": transcript_id})
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        try:
            # Generate summary using Gemini
            summary = await generate_summary_with_gemini(
                transcript["original_text"], 
                transcript["custom_prompt"]
            )
            
            # Update transcript with generated summary
            try:
                await db.transcripts.update_one(
                    {"id": transcript_id},
                    {
                        "$set": {
                            "generated_summary": summary,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                return {"summary": summary}
            except Exception as db_error:
                print(f"Error updating transcript with summary: {db_error}")
                raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
    except Exception as db_error:
        print(f"Error fetching transcript {transcript_id}: {db_error}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")

@app.put("/api/transcripts/{transcript_id}/summary")
async def update_summary(transcript_id: str, update: TranscriptUpdate):
    """Update the edited summary"""
    try:
        transcript = await db.transcripts.find_one({"id": transcript_id})
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        try:
            await db.transcripts.update_one(
                {"id": transcript_id},
                {
                    "$set": {
                        "edited_summary": update.edited_summary,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return {"message": "Summary updated successfully"}
        except Exception as db_error:
            print(f"Error updating summary: {db_error}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    except Exception as db_error:
        print(f"Error fetching transcript {transcript_id}: {db_error}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")

@app.post("/api/transcripts/{transcript_id}/email")
async def send_email(transcript_id: str, email_request: EmailRequest):
    """Send summary via email using Gmail API"""
    sent_emails = []
    failed_emails = []
    
    try:
        transcript = await db.transcripts.find_one({"id": transcript_id})
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Get the summary to send (prefer edited_summary, fallback to generated_summary)
        summary_to_send = transcript.get("edited_summary") or transcript.get("generated_summary")
        if not summary_to_send:
            raise HTTPException(status_code=400, detail="No summary available to send")
        
        # Prepare email content
        email_body = f"""
Meeting Summary: {transcript['title']}

{summary_to_send}

---
This summary was generated by AI Meeting Notes Summarizer
        """.strip()
        
        # Send email to each recipient
        for recipient in email_request.recipients:
            try:
                # Use the new send_email_smtp function
                send_email_smtp([recipient], email_request.subject or f"Meeting Summary: {transcript['title']}", email_body)
                sent_emails.append(recipient)
                
            except Exception as e:
                failed_emails.append({"email": recipient, "error": str(e)})
        
        # Log the email request
        email_log = {
            "id": str(uuid.uuid4()),
            "transcript_id": transcript_id,
            "recipients": email_request.recipients,
            "subject": email_request.subject,
            "sent_at": datetime.utcnow(),
            "status": "sent" if not failed_emails else "partial",
            "sent_count": len(sent_emails),
            "failed_count": len(failed_emails),
            "failed_emails": failed_emails
        }
        
        try:
            await db.email_logs.insert_one(email_log)
        except Exception as log_error:
            print(f"Error logging email: {log_error}")
            # Continue even if logging fails
            
        if failed_emails:
            return {
                "message": f"Email sent to {len(sent_emails)} recipients, failed for {len(failed_emails)}",
                "recipients": email_request.recipients,
                "subject": email_request.subject,
                "sent_emails": sent_emails,
                "failed_emails": failed_emails
            }
        else:
            return {
                "message": f"Email sent successfully to {len(sent_emails)} recipients",
                "recipients": email_request.recipients,
                "subject": email_request.subject,
                "sent_emails": sent_emails
            }
            
    except Exception as e:
        print(f"Error in send_email: {e}")
        if isinstance(e, HTTPException):
            raise e
        
        # Log the failed attempt
        try:
            email_log = {
                "id": str(uuid.uuid4()),
                "transcript_id": transcript_id,
                "recipients": email_request.recipients,
                "subject": email_request.subject,
                "sent_at": datetime.utcnow(),
                "status": "failed",
                "error": str(e)
            }
            
            try:
                await db.email_logs.insert_one(email_log)
            except Exception as log_error:
                print(f"Error logging email failure: {log_error}")
        except Exception as log_error:
            print(f"Error creating log entry: {log_error}")
        
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.delete("/api/transcripts/{transcript_id}")
async def delete_transcript(transcript_id: str):
    """Delete a transcript"""
    result = await db.transcripts.delete_one({"id": transcript_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {"message": "Transcript deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    