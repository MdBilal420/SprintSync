#!/usr/bin/env python3
"""
Manual test script for AI integration
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def manual_test():
    """Manual test of AI integration"""
    print("🔧 Manual AI Integration Test")
    print("=" * 30)
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded")
    except Exception as e:
        print(f"⚠️  Warning: {e}")
    
    # Check API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return False
    
    print("✅ OPENAI_API_KEY found in environment")
    
    # Test OpenAI package
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client created")
        
        # Simple test
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            max_tokens=10
        )
        print("✅ OpenAI API call successful")
        print(f"   Response: {response.choices[0].message.content.strip()}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI test failed: {e}")
        return False

if __name__ == "__main__":
    success = manual_test()
    if success:
        print("\n🎉 AI integration is working!")
    else:
        print("\n🚨 AI integration needs troubleshooting")