# backend/services/ai_helpers.py
import time
from fastapi import HTTPException
from openai import OpenAI

def create_chat_completion_with_retry(
    client: OpenAI,
    model: str,
    messages: list,
    max_retries: int = 3,
    retry_delay: int = 2,
    **kwargs
):
    """
    Create a chat completion with automatic retry on rate limit errors.
    
    Args:
        client: OpenAI client instance
        model: Model name
        messages: List of message dicts
        max_retries: Maximum number of retry attempts
        retry_delay: Base delay in seconds (uses exponential backoff)
        **kwargs: Additional arguments to pass to chat.completions.create
    
    Returns:
        Response from OpenAI API
    
    Raises:
        HTTPException: If rate limit persists after all retries
    """
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                **kwargs
            )
            return response
        except Exception as e:
            error_str = str(e)
            # Check if it's a rate limit error (429)
            if "429" in error_str or "rate" in error_str.lower() or "rate limit" in error_str.lower():
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                    print(f"Rate limit hit. Retrying in {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    raise HTTPException(
                        status_code=429,
                        detail="AI service is currently rate-limited. Please try again in a few moments. "
                               "For better reliability, consider using a paid model by setting OPENROUTER_MODEL in your .env file."
                    )
            else:
                # Not a rate limit error, re-raise immediately
                raise

