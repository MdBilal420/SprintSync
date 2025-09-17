#!/usr/bin/env python3
"""
Test script to verify AI integration is working
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from ai.client import test_ai_connection, get_ai_client
from ai.task_description import generate_task_description, TaskDescriptionRequest

async def test_ai_integration():
    """Test AI integration functionality"""
    print("🤖 Testing SprintSync AI Integration...")
    print("=" * 50)
    
    # Test 1: Check AI connection
    print("\n1️⃣ Testing AI Connection...")
    status = await test_ai_connection()
    print(f"Status: {status}")
    
    if not status['available']:
        print("❌ AI service not available. Check your OpenAI API key.")
        return False
    
    print("✅ AI service is connected!")
    
    # Test 2: Test task description generation
    print("\n2️⃣ Testing Task Description Generation...")
    try:
        request = TaskDescriptionRequest(
            title="Create user authentication system",
            context="Web application with JWT tokens",
            project_type="web_application",
            complexity="medium"
        )
        
        response = generate_task_description(request)
        print(f"✅ Generated description successfully!")
        print(f"Title: {response.title}")
        print(f"AI Generated: {response.ai_generated}")
        print(f"Description length: {len(response.description)} chars")
        print(f"Acceptance criteria: {len(response.acceptance_criteria)} items")
        print(f"Technical notes: {len(response.technical_notes)} items")
        if response.estimated_hours:
            print(f"Estimated hours: {response.estimated_hours}")
        
        return True
        
    except Exception as e:
        print(f"❌ Task description generation failed: {e}")
        return False

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    success = asyncio.run(test_ai_integration())
    
    if success:
        print("\n🎉 All AI integration tests passed!")
        print("Your SprintSync AI features are ready to use!")
    else:
        print("\n🚨 AI integration tests failed.")
        print("Please check your OpenAI API key configuration.")