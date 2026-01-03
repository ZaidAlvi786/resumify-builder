# Vercel Deployment Guide for Resumify AI

This guide will help you deploy your Resumify AI application on Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your GitHub repository pushed to GitHub
3. Backend API deployed (see Backend Deployment section)

## Frontend Deployment on Vercel

### Step 1: Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `ZaidAlvi786/resumify-builder`
4. Select the repository and click "Import"

### Step 2: Configure Project Settings

**Root Directory:**
- Set Root Directory to: `frontend`

**Framework Preset:**
- Framework: Next.js (auto-detected)

**Build Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### Step 3: Environment Variables

Add these environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add the following variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/resume
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** 
- Replace `your-backend-url.com` with your actual backend deployment URL
- Get Supabase credentials from your Supabase project settings

### Step 4: Deploy

1. Click "Deploy" button
2. Wait for the build to complete
3. Your app will be live at: `https://your-project.vercel.app`

## Backend Deployment Options

Since your backend is FastAPI (Python), you have several options:

### Option 1: Railway (Recommended)
1. Sign up at https://railway.app
2. Create new project → Deploy from GitHub
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `OPENROUTER_API_KEY=your_key`
   - `OPENROUTER_MODEL=your_model`
6. Railway will auto-detect Python and install dependencies

### Option 2: Render
1. Sign up at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

### Option 3: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in backend directory
3. Follow the prompts

### Option 4: Vercel Serverless Functions (Advanced)
You can convert FastAPI routes to Vercel serverless functions, but this requires code restructuring.

## Post-Deployment

### Update Frontend API URL

After deploying the backend, update the `NEXT_PUBLIC_API_URL` in Vercel:
1. Go to Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy the frontend

### CORS Configuration

Make sure your backend allows requests from your Vercel domain. Add to your FastAPI backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",
        "http://localhost:3000"  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### API Calls Fail
- Check CORS settings on backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables

## Quick Deploy Command

If you have Vercel CLI installed:

```bash
cd frontend
npm i -g vercel
vercel
```

Follow the prompts to deploy.

