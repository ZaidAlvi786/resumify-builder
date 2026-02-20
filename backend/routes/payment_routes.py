# backend/routes/payment_routes.py
import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str
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
            discounts=[{'coupon': data.promo_code}] if data.promo_code else [],
            allow_promotion_codes=True if not data.promo_code else False
        )
        return {"url": checkout_session.url}
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
        # TODO: Update user's subscription and credits in database
        print(f"Payment successful for session: {session['id']}")
    
    return {"status": "success"}
