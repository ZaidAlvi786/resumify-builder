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
        
        # Non-streaming logic (existing)
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
                # Check if it's a rate limit error (429) or a general API failure
                is_rate_limit = (
                    "429" in error_str or 
                    "rate" in error_str.lower() or 
                    "rate limit" in error_str.lower() or
                    "quota" in error_str.lower() or
                    "limit exceeded" in error_str.lower()
                )
                
                # Check for other retryable/switchable errors (timeouts, connection issues)
                is_network_error = any(msg in error_str.lower() for msg in [
                    "timeout", "connection", "disconnected", "unavailable", "server error", "50"
                ])
                
                # If we have more models to try, switch to next model for rate limits or network errors
                if (is_rate_limit or is_network_error) and model_idx < len(model_list) - 1:
                    print(f"⚠ Issue with {current_model}: {error_str[:100]}... Switching to next model: {model_list[model_idx + 1]}")
                    break  # Break out of retry loop to try next model
                
                # If it's a rate limit on the last model, or a generic error with retries left
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                    print(f"⚠ Error on {current_model}: {error_str[:100]}... Retrying in {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    # All models exhausted or all retries used for current model
                    if model_idx < len(model_list) - 1:
                        # If we have more models, try the next one even if it wasn't a "retryable" error
                        # This handles cases where one model might be misconfigured but others are fine
                        print(f"⚠ Persistent error on {current_model}. Attempting next model: {model_list[model_idx + 1]}")
                        break
                    
                    # Truly the last straw
                    raise HTTPException(
                        status_code=502 if is_network_error else 429 if is_rate_limit else 500,
                        detail=f"AI service failed after trying all available models. "
                               f"Tried: {', '.join(model_list)}. Final error: {error_str}"
                    )
    
    # Should never reach here, but just in case
    raise HTTPException(
        status_code=500,
        detail="Unexpected error: All models exhausted without success."
    )

