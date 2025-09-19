#!/usr/bin/env python3
"""
Comprehensive test to diagnose AI integration issues
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

def test_environment_and_ai():
    """Test environment variables and AI configuration"""
    print("🔧 Comprehensive SprintSync AI Diagnostic")
    print("=" * 50)
    
    # Check current working directory
    print(f"\n📂 Current Directory: {os.getcwd()}")
    
    # Check if .env file exists
    env_path = Path(".env")
    if env_path.exists():
        print(f"✅ .env file found at: {env_path.absolute()}")
        # Read and display first few lines
        with open(env_path, 'r') as f:
            lines = f.readlines()
            for i, line in enumerate(lines[:10]):
                if 'OPENAI_API_KEY' in line:
                    if '=' in line:
                        key_part = line.split('=', 1)[1].strip()
                        if key_part.startswith('sk-'):
                            masked = key_part[:7] + '*' * (len(key_part) - 10) + key_part[-3:]
                            print(f"   OpenAI API Key: {masked}")
                        else:
                            print(f"   OpenAI API Key: Found but invalid format")
                    else:
                        print(f"   OpenAI API Key line: {line.strip()}")
    else:
        print(f"❌ .env file not found")
        return False
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded")
    except ImportError:
        print("❌ python-dotenv not installed")
        return False
    
    # Check OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return False
    
    if not api_key.startswith('sk-'):
        print("❌ OPENAI_API_KEY has invalid format")
        return False
    
    print(f"✅ OpenAI API Key: Set and valid format")
    
    # Test OpenAI package
    try:
        import openai
        print("✅ OpenAI package available")
    except ImportError:
        print("❌ OpenAI package not installed")
        return False
    
    # Test AI client creation
    try:
        from app.ai.client import get_ai_client, test_ai_connection
        client = get_ai_client()
        if client:
            print("✅ AI Client created successfully")
        else:
            print("❌ AI Client creation failed")
            return False
    except Exception as e:
        print(f"❌ AI Client creation error: {e}")
        return False
    
    # Test AI connection
    try:
        import asyncio
        result = asyncio.run(test_ai_connection())
        print(f"✅ AI Connection Test Result: {result}")
        if result.get('available'):
            print("🎉 AI Integration is working!")
            return True
        else:
            print(f"❌ AI Integration issue: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ AI Connection Test error: {e}")
        return False

if __name__ == "__main__":
    success = test_environment_and_ai()
    if success:
        print("\n🎉 All tests passed! AI should be working.")
    else:
        print("\n🚨 Issues found. Please check the output above.")