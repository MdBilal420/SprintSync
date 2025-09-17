#!/usr/bin/env python3
"""
Direct test of AI functionality
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def direct_ai_test():
    """Direct test of AI functionality"""
    print("🔧 Direct AI Functionality Test")
    print("=" * 35)
    
    # Load environment
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment loaded")
    except Exception as e:
        print(f"⚠️  Environment loading issue: {e}")
    
    # Check API key directly
    api_key = os.getenv('OPENAI_API_KEY')
    print(f"API Key from env: {'Found' if api_key else 'Not found'}")
    
    if api_key:
        print(f"API Key format valid: {api_key.startswith('sk-')}")
        if len(api_key) > 20:
            print(f"API Key preview: {api_key[:10]}...{api_key[-5:]}")
    
    # Try importing and testing AI client directly
    try:
        from app.ai.client import get_ai_client, test_ai_connection
        print("✅ AI client module imported")
        
        client = get_ai_client()
        print(f"AI Client: {'Created' if client else 'Not created'}")
        
        if client:
            print("🎉 AI integration appears to be working!")
            return True
        else:
            print("❌ AI client not created - likely missing API key")
            
    except Exception as e:
        print(f"❌ AI client error: {e}")
        import traceback
        traceback.print_exc()
    
    return False

if __name__ == "__main__":
    direct_ai_test()