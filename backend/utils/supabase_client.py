# backend/utils/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url:
    print("CRITICAL: SUPABASE_URL is not set in backend/.env")
if not supabase_key:
    print("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env")

supabase: Client = create_client(supabase_url or "", supabase_key or "") if supabase_url and supabase_key else None
