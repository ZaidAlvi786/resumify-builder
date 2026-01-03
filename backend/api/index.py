# Vercel serverless function entry point
from main import app

# Export the FastAPI app for Vercel
handler = app

