# Resumify AI - AI Resume Builder

The world's most advanced AI-powered resume builder. Create ATS-optimized resumes, get AI feedback, and land your dream job.

## Features

- 🤖 **AI Resume Agent** - Conversational AI assistant for resume help
- 📝 **Smart Resume Builder** - Build professional resumes with AI optimization
- 🎯 **Resume Targeting** - Target your resume for specific job roles
- 📊 **Resume Scoring** - Get detailed ATS score and improvement suggestions
- 📄 **Multiple Templates** - Choose from modern, classic, minimalist, executive, and creative templates
- 📤 **Resume Upload** - Upload existing resumes and parse them automatically
- 🔄 **Version History** - Track all your resume versions
- 📧 **Cover Letter Generator** - AI-powered cover letter creation
- 💼 **Interview Prep** - Practice with AI-generated interview questions
- 🌍 **Multi-language Support** - Translate resumes to 12+ languages
- 📈 **Analytics Dashboard** - Comprehensive resume analytics

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI
- Python
- OpenAI (via OpenRouter)
- Supabase

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resumify-builder.git
cd resumify-builder
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
- Create `.env` file in `backend/` with your OpenRouter API key
- Set up Supabase credentials in `frontend/src/lib/supabase.ts`

5. Run the development server:
```bash
# Frontend (from frontend directory)
npm run dev

# Backend (from backend directory)
python main.py
```

## License

MIT License

