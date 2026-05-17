# backend/services/ai_client.py
"""Shared OpenRouter client + automatic model-fallback wrapper.

Extracted from ai_service.py so the JD-extraction, tailoring, and skeleton
services can issue LLM calls without importing the large ai_service module.
ai_service.py re-exports every name below, so its behaviour is unchanged.
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

from services.ai_helpers import create_chat_completion_with_retry

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError(
        "OPENROUTER_API_KEY environment variable is not set. "
        "Please create a .env file in the backend directory with your OpenRouter API key."
    )

# Initialize OpenAI client with OpenRouter configuration
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

# Primary model. Free tier default; override with OPENROUTER_MODEL.
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")

# Fallback models for automatic switching when rate limits are reached.
# Override with OPENROUTER_FALLBACK_MODELS (comma-separated) or use defaults.
fallback_models_str = os.getenv("OPENROUTER_FALLBACK_MODELS", "")
if fallback_models_str:
    FALLBACK_MODELS = [m.strip() for m in fallback_models_str.split(",") if m.strip()]
else:
    FALLBACK_MODELS = [
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-1.5-flash",
        "google/gemini-pro",
        "openai/gpt-4o-mini",
    ]

# Avoid duplicating the primary model inside the fallback list.
if MODEL_NAME in FALLBACK_MODELS:
    FALLBACK_MODELS.remove(MODEL_NAME)

# Complete ordered model list: primary first, then fallbacks.
MODEL_LIST = [MODEL_NAME] + FALLBACK_MODELS


def create_chat_completion_with_auto_fallback(
    messages: list,
    model: str = MODEL_NAME,
    max_retries: int = 3,
    retry_delay: int = 2,
    **kwargs,
):
    """Wrapper that automatically supplies the fallback model list, so every
    LLM call gets automatic model switching on rate limits."""
    return create_chat_completion_with_retry(
        client=client,
        model=model,
        messages=messages,
        max_retries=max_retries,
        retry_delay=retry_delay,
        fallback_models=FALLBACK_MODELS,
        **kwargs,
    )
