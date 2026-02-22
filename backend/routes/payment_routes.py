# backend/routes/payment_routes.py
import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from utils.supabase_client import supabase
from datetime import datetime

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str
    user_id: str
    promo_code: Optional[str] = None

@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutSessionRequest):
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': data.price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=data.success_url,
            cancel_url=data.cancel_url,
            client_reference_id=data.user_id,
            metadata={
                "user_id": data.user_id
            },
            discounts=[{'coupon': data.promo_code}] if data.promo_code else [],
            allow_promotion_codes=True if not data.promo_code else False
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-portal-session")
async def create_portal_session(data: dict):
    user_id = data.get("user_id")
    return_url = data.get("return_url")
    
    try:
        # Get customer ID from profiles
        response = supabase.table("profiles").select("stripe_customer_id").eq("id", user_id).execute()
        if not response.data or not response.data[0].get("stripe_customer_id"):
            raise HTTPException(status_code=400, detail="No Stripe customer found for this user")
        
        customer_id = response.data[0]["stripe_customer_id"]
        
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return {"url": portal_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('client_reference_id') or session.get('metadata', {}).get('user_id')
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        
        if user_id:
            # Determine plan name from line items or metadata
            plan_name = "pro" # fallback
            credits = 100
            
            try:
                line_items = stripe.checkout.Session.list_line_items(session['id'])
                if line_items.data:
                    price_id = line_items.data[0].price.id
                    # Simple mapping - in a real app, use product metadata or IDs
                    if "ultra" in price_id.lower():
                        plan_name = "ultra"
                        credits = 999999 # unlimited-ish
                    elif "pro" in price_id.lower():
                        plan_name = "pro"
                        credits = 1000
            except Exception:
                pass

            # Update user profile
            if supabase:
                supabase.table("profiles").update({
                    "stripe_customer_id": customer_id,
                    "plan": plan_name,
                    "credits": credits
                }).eq("id", user_id).execute()
            else:
                print("Error: Supabase client not initialized. Plan not updated.")
            
            # Record subscription details
            if subscription_id and supabase:
                try:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    supabase.table("subscriptions").upsert({
                        "user_id": user_id,
                        "stripe_subscription_id": subscription_id,
                        "status": subscription.get('status'),
                        "price_id": subscription.get('items', {}).get('data', [{}])[0].get('price', {}).get('id'),
                        "current_period_start": datetime.fromtimestamp(subscription.get('current_period_start', 0)).isoformat() if subscription.get('current_period_start') else None,
                        "current_period_end": datetime.fromtimestamp(subscription.get('current_period_end', 0)).isoformat() if subscription.get('current_period_end') else None,
                    }).execute()
                except Exception as sub_err:
                    print(f"Error recording subscription details: {str(sub_err)}")
                    
    elif event['type'] == 'invoice.paid':
        invoice = event['data']['object']
        subscription_id = invoice.get('subscription')
        if subscription_id and supabase:
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
                supabase.table("subscriptions").update({
                    "status": subscription.get('status'),
                    "current_period_start": datetime.fromtimestamp(subscription.get('current_period_start', 0)).isoformat() if subscription.get('current_period_start') else None,
                    "current_period_end": datetime.fromtimestamp(subscription.get('current_period_end', 0)).isoformat() if subscription.get('current_period_end') else None,
                }).eq("stripe_subscription_id", subscription_id).execute()
            except Exception as inv_err:
                print(f"Error updating subscription on invoice.paid: {str(inv_err)}")
            
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        subscription_id = subscription.get('id')
        
        # Mark subscription as canceled
        supabase.table("subscriptions").update({
            "status": "canceled"
        }).eq("stripe_subscription_id", subscription_id).execute()
        
        # Revert plan to free
        # Find user_id by subscription_id
        response = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription_id).execute()
        if response.data:
            user_id = response.data[0]['user_id']
            supabase.table("profiles").update({"plan": "free"}).eq("id", user_id).execute()

    return {"status": "success"}
