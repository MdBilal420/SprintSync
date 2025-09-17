"""
OpenAI client configuration and utilities.
"""

import os
from typing import Optional
import openai
from openai import OpenAI

from ..core.config import settings


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
    # Try getting API key from settings first, then from environment
    api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
    
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
        # Check if API key is configured
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {
                "available": False,
                "configured": False,
                "status": "not_configured",
                "message": "OpenAI API key not found in environment variables or settings"
            }
        
        # Check if API key format looks correct
        if not api_key.startswith('sk-'):
            return {
                "available": False,
                "configured": True,
                "status": "invalid_key",
                "message": "OpenAI API key format appears invalid"
            }
        
        # Create client
        client = OpenAI(api_key=api_key)
        
        # Test with a simple completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            max_tokens=10
        )
        
        return {
            "available": True,
            "configured": True,
            "status": "connected",
            "message": "AI service is operational",
            "model": "gpt-3.5-turbo",
            "response_test": response.choices[0].message.content.strip()
        }
        
    except Exception as e:
        return {
            "available": False,
            "configured": True,
            "status": "error",
            "message": f"AI service test failed: {str(e)}"
        }