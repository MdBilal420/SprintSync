#!/usr/bin/env python3
"""
Test to verify settings are loading correctly
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def test_settings():
    """Test if settings are loading correctly"""
    print("🔧 Settings Loading Test")
    print("=" * 30)
    
    # Load environment variables first
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded")
    except ImportError:
        print("❌ python-dotenv not available")
    
    # Check environment variables directly
    env_api_key = os.getenv('OPENAI_API_KEY')
    print(f"Environment OPENAI_API_KEY: {'Set' if env_api_key else 'Not set'}")
    if env_api_key:
        print(f"  Key preview: {env_api_key[:10]}...")
    
    # Check settings
    try:
        from app.core.config import settings
        print("✅ Settings module loaded")
        
        settings_api_key = settings.openai_api_key
        print(f"Settings OPENAI_API_KEY: {'Set' if settings_api_key else 'Not set'}")
        if settings_api_key:
            print(f"  Key preview: {settings_api_key[:10]}...")
            
        print(f"Environment: {settings.environment}")
        print(f"Debug: {settings.debug}")
        
    except Exception as e:
        print(f"❌ Settings loading error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_settings()