# AI Meeting Notes Summarizer

An intelligent application that automatically summarizes meeting transcripts using AI and allows you to share summaries via email.

## ✨ Features

- **AI-Powered Summaries**: Uses Google's Gemini AI to generate intelligent meeting summaries
- **Custom Prompts**: Define how you want your summaries structured
- **Email Sharing**: Send summaries directly via Gmail SMTP
- **Real-time Editing**: Edit AI-generated summaries before sharing
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Fast API**: Built with FastAPI for optimal performance

## 🚀 Live Demo

Once deployed, your application will be available at:
- **Frontend**: Your Render Frontend URL (e.g., https://meeting-notes-frontend.onrender.com)
- **Backend API**: Your Render Backend URL (e.g., https://meeting-notes-api.onrender.com)

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - Database for storing transcripts and summaries
- **Google Gemini AI** - AI-powered text summarization
- **Gmail SMTP** - Email functionality

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Textarea Autosize** - Auto-resizing text areas

### Deployment
- **Render** - Full-stack deployment platform with automatic deployments from GitHub

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)
- Google Gemini API key
- Gmail account with app password

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/meeting-notes-summarizer.git
cd meeting-notes-summarizer
```

### 2. Set Up Environment Variables

#### Backend
Create a `.env` file in the `backend` directory using the provided `.env.example` template:
```bash
cd backend
cp .env.example .env
# Edit .env with your actual credentials
```

#### Frontend
Create a `.env` file in the `frontend` directory using the provided `.env.example` template:
```bash
cd frontend
cp .env.example .env
# Edit .env with your actual backend URL
```

### 3. Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 Deployment to Render

This project includes a `render.yaml` file for easy deployment to Render.

### 1. Create a Render Account
Sign up at [render.com](https://render.com) if you don't have an account.

### 2. Connect Your GitHub Repository
1. Push your code to GitHub
2. In Render dashboard, click "New" and select "Blueprint"
3. Connect your GitHub account and select your repository
4. Render will automatically detect the `render.yaml` file

### 3. Configure Environment Variables
For both services (backend and frontend), you'll need to set up the following environment variables in the Render dashboard:

#### Backend Service
- `MONGO_URL`: Your MongoDB connection string (MongoDB Atlas recommended)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `Email`: Your Gmail address
- `Pass`: Your Gmail app password

#### Frontend Service
- `REACT_APP_BACKEND_URL`: This will be automatically set to your backend service hostname

### 4. Deploy
Click "Apply" and Render will deploy both your backend and frontend services.

### 5. Access Your Application
Once deployment is complete, you can access your application at the URLs provided by Render.

### 4. Backend Setup (Alternative Manual Setup)
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
GEMINI_API_KEY=your_gemini_api_key
Email=your_email@gmail.com
Pass=your_gmail_app_password
```

Start the backend:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Start the frontend:
```bash
npm start
```

## 📧 Email Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** in your `.env` file

## 🚀 Deployment

### Render Deployment

#### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### Step 2: Deploy Backend to Render
1. **Go to [render.com](https://render.com/)**
2. **Sign up/Login with GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service**:
   - **Name**: `meeting-notes-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python main.py`
   - **Root Directory**: Leave empty (root of repo)

#### Step 3: Set Backend Environment Variables
In Render dashboard, add these environment variables:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/meeting_notes?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
Email=tewatiatewatia382@gmail.com
Pass=ylaw cuzv uzuy elfx
```

#### Step 4: Deploy Frontend to Render
1. **In the same project, click "New +" → "Static Site"**
2. **Connect the same GitHub repository**
3. **Configure the service**:
   - **Name**: `meeting-notes-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

#### Step 5: Set Frontend Environment Variable
Add this environment variable:
```
REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
```

#### Step 6: Deploy
- Both services will deploy automatically
- Render provides HTTPS URLs for both frontend and backend
- Environment variables are securely managed in Render dashboard

**Benefits of Render:**
- ✅ Free tier available (750 hours/month)
- ✅ Automatic HTTPS and custom domains
- ✅ Easy environment variable management
- ✅ Built-in monitoring and logs
- ✅ Simple GitHub integration

## 📁 Project Structure

```
meeting-notes-summarizer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── App.css         # Custom styles
│   ├── package.json        # Node.js dependencies
│   └── .env                # Frontend environment
└── README.md               # This file
```

## 🔧 API Endpoints

- `GET /api/transcripts` - Get all transcripts
- `POST /api/transcripts` - Create new transcript
- `GET /api/transcripts/{id}` - Get specific transcript
- `POST /api/transcripts/{id}/generate-summary` - Generate AI summary
- `PUT /api/transcripts/{id}/summary` - Update summary
- `POST /api/transcripts/{id}/email` - Send summary via email
- `DELETE /api/transcripts/{id}` - Delete transcript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the Render deployment logs
2. Verify your environment variables in Render dashboard
3. Ensure MongoDB Atlas is accessible
4. Check Gmail app password settings
5. Review Render service health status

## 🙏 Acknowledgments

- Google Gemini AI for intelligent summarization
- FastAPI for the robust backend framework
- React and Tailwind CSS for the beautiful UI
- Render for seamless full-stack deployment
