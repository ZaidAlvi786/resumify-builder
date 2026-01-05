# backend/services/ai_helpers.py
import time
from fastapi import HTTPException
from openai import OpenAI
from typing import List, Optional

def create_chat_completion_with_retry(
    client: OpenAI,
    model: str,
    messages: list,
    max_retries: int = 3,
    retry_delay: int = 2,
    fallback_models: Optional[List[str]] = None,
    **kwargs
):
    """
    Create a chat completion with automatic retry on rate limit errors and automatic model switching.
    
    Args:
        client: OpenAI client instance
        model: Primary model name to use
        messages: List of message dicts
        max_retries: Maximum number of retry attempts per model
        retry_delay: Base delay in seconds (uses exponential backoff)
        fallback_models: Optional list of fallback models to try when rate limits are hit
        **kwargs: Additional arguments to pass to chat.completions.create
    
    Returns:
        Response from OpenAI API
    
    Raises:
        HTTPException: If rate limit persists after trying all models
    """
    # Build the complete model list: primary model first, then fallbacks
    model_list = [model]
    if fallback_models:
        # Add fallback models that aren't already the primary model
        for fallback in fallback_models:
            if fallback != model and fallback not in model_list:
                model_list.append(fallback)
    
    # Try each model in sequence
    for model_idx, current_model in enumerate(model_list):
        model_display = f"{current_model} ({model_idx + 1}/{len(model_list)})"
        
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    **kwargs
                )
                # Log successful model usage if we switched models
                if model_idx > 0:
                    print(f"✓ Successfully used fallback model: {current_model}")
                return response
            except Exception as e:
                error_str = str(e)
                # Check if it's a rate limit error (429)
                is_rate_limit = (
                    "429" in error_str or 
                    "rate" in error_str.lower() or 
                    "rate limit" in error_str.lower() or
                    "quota" in error_str.lower() or
                    "limit exceeded" in error_str.lower()
                )
                
                if is_rate_limit:
                    # If we have more models to try, switch to next model
                    if model_idx < len(model_list) - 1:
                        print(f"⚠ Rate limit hit on {current_model}. Switching to next model: {model_list[model_idx + 1]}")
                        break  # Break out of retry loop to try next model
                    elif attempt < max_retries - 1:
                        # Last model, but still have retries left
                        wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                        print(f"⚠ Rate limit hit on {current_model}. Retrying in {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        # All models exhausted and all retries used
                        raise HTTPException(
                            status_code=429,
                            detail=f"AI service is currently rate-limited on all available models. "
                                   f"Tried models: {', '.join(model_list)}. "
                                   f"Please try again in a few moments or add more models to OPENROUTER_FALLBACK_MODELS."
                        )
                else:
                    # Not a rate limit error - re-raise immediately
                    # We only switch models for rate limits, not other errors
                    raise
    
    # Should never reach here, but just in case
    raise HTTPException(
        status_code=500,
        detail="Unexpected error: All models exhausted without success."
    )

