# backend/utils/subscription_helper.py
from utils.supabase_client import supabase

async def get_user_subscription_status(user_id: str):
    """
    Fetches the user's plan and remaining credits from the profiles table.
    """
    try:
        response = supabase.table("profiles").select("plan, credits").eq("id", user_id).execute()
        if response.data:
            return response.data[0]
        return {"plan": "free", "credits": 0}
    except Exception as e:
        print(f"Error fetching subscription status: {e}")
        return {"plan": "free", "credits": 0}

async def has_sufficient_credits(user_id: str, cost: int = 1):
    """
    Checks if a user has enough credits and returns True/False.
    """
    status = await get_user_subscription_status(user_id)
    if status["plan"] == "pro":
        return True # Pro users might have unlimited or high limits
    return status["credits"] >= cost

async def deduct_credits(user_id: str, amount: int = 1):
    """
    Deducts credits from a user's account.
    """
    status = await get_user_subscription_status(user_id)
    if status["plan"] == "pro":
        return True # Don't deduct from Pro for now, or implement a different logic
    
    new_credits = max(0, status["credits"] - amount)
    try:
        supabase.table("profiles").update({"credits": new_credits}).eq("id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error deducting credits: {e}")
        return False
