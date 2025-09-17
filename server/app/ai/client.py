"""
OpenAI client configuration and utilities.
"""

import os
from typing import Optional
import openai
from openai import OpenAI


class AIError(Exception):
    """Custom exception for AI service errors."""
    pass


def get_ai_client() -> Optional[OpenAI]:
    """
    Get configured OpenAI client.
    
    Returns:
        OpenAI client instance or None if not configured
        
    Raises:
        AIError: If client configuration fails
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return None
    
    try:
        client = OpenAI(api_key=api_key)
        return client
    except Exception as e:
        raise AIError(f"Failed to initialize OpenAI client: {str(e)}")


def is_ai_available() -> bool:
    """
    Check if AI service is available.
    
    Returns:
        True if AI is configured and available, False otherwise
    """
    try:
        client = get_ai_client()
        return client is not None
    except AIError:
        return False


async def test_ai_connection() -> dict:
    """
    Test AI service connection.
    
    Returns:
        Dictionary with connection status and details
    """
    try:
        client = get_ai_client()
        if not client:
            return {
                "available": False,
                "status": "not_configured",
                "message": "OpenAI API key not found in environment variables"
            }
        
        # Test with a simple completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            max_tokens=10
        )
        
        return {
            "available": True,
            "status": "connected",
            "message": "AI service is operational",
            "model": "gpt-3.5-turbo",
            "response_test": response.choices[0].message.content.strip()
        }
        
    except Exception as e:
        return {
            "available": False,
            "status": "error",
            "message": f"AI service test failed: {str(e)}"
        }