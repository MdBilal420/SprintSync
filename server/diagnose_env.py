#!/usr/bin/env python3
"""
Diagnostic script to check environment variables and AI configuration
"""

import os
from dotenv import load_dotenv

def diagnose_environment():
    """Check environment configuration"""
    print("🔧 SprintSync Environment Diagnostic")
    print("=" * 40)
    
    # Load environment variables
    load_dotenv()
    
    print("\n1️⃣ Environment Variables Check:")
    print(f"   ENVIRONMENT: {os.getenv('ENVIRONMENT', 'Not set')}")
    print(f"   DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')}")
    
    # Check OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print(f"   OPENAI_API_KEY: {'✅ Set' if api_key.startswith('sk-') else '❌ Invalid format'}")
        if api_key.startswith('sk-'):
            masked_key = api_key[:7] + '*' * (len(api_key) - 10) + api_key[-3:]
            print(f"   Key preview: {masked_key}")
    else:
        print("   OPENAI_API_KEY: ❌ Not set")
    
    print(f"   SECRET_KEY: {'✅ Set' if os.getenv('SECRET_KEY') else '❌ Not set'}")
    
    print("\n2️⃣ Current Working Directory:")
    print(f"   {os.getcwd()}")
    
    print("\n3️⃣ Environment File Check:")
    env_files = ['.env', '.env.local', '.env.development']
    for env_file in env_files:
        if os.path.exists(env_file):
            print(f"   ✅ {env_file} found")
        else:
            print(f"   ❌ {env_file} not found")
    
    print("\n4️⃣ Python Path:")
    import sys
    print(f"   {sys.executable}")
    
    # Try importing required packages
    print("\n5️⃣ Package Import Check:")
    try:
        import openai
        print("   ✅ openai package available")
    except ImportError:
        print("   ❌ openai package not available")
    
    try:
        import dotenv
        print("   ✅ python-dotenv package available")
    except ImportError:
        print("   ❌ python-dotenv package not available")

if __name__ == "__main__":
    diagnose_environment()