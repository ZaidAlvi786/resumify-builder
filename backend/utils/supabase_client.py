# backend/utils/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    # We'll log a warning but not raise an error immediately to allow the app to start
    # even if these aren't configured yet (e.g. during initial setup)
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env")

supabase: Client = create_client(supabase_url or "", supabase_key or "") if supabase_url and supabase_key else None
