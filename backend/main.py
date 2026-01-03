# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import resume_routes

load_dotenv()

app = FastAPI(
    title="AI Resume Builder API",
    description="API for generating and reviewing resumes using AI",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js frontend (local)
    "http://127.0.0.1:3000",
    "https://*.vercel.app",  # Vercel deployments
    os.getenv("FRONTEND_URL", ""),  # Custom frontend URL from env
]

# Allow all origins for Railway deployment (you can restrict later)
# Railway provides dynamic URLs, so we allow all for flexibility
# In production, you can add specific domains
if os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("ENVIRONMENT") != "production":
    origins.append("*")  # Allow all for Railway/Vercel deployments
else:
    # Filter out empty strings and wildcards in strict production
    origins = [origin for origin in origins if origin and origin != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(resume_routes.router, prefix="/api/resume", tags=["Resume"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Resume Builder API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
