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

- **Application**: [Your Railway App URL]
- **Backend API**: [Your Railway Backend URL]

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
- **Railway** - Full-stack deployment platform

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

### 2. Backend Setup
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

### Railway Deployment
1. **Push code to GitHub**
2. **Connect repository to [Railway.app](https://railway.app/)**
3. **Add environment variables in Railway dashboard**
4. **Deploy both frontend and backend services**

Railway will automatically detect your Python backend and React frontend, deploying them as separate services in the same project.

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
1. Check the Railway deployment logs
2. Verify your environment variables in Railway dashboard
3. Ensure MongoDB Atlas is accessible
4. Check Gmail app password settings
5. Review Railway service health status

## 🙏 Acknowledgments

- Google Gemini AI for intelligent summarization
- FastAPI for the robust backend framework
- React and Tailwind CSS for the beautiful UI
- Railway for seamless full-stack deployment
