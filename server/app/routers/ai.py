"""
AI router.

Provides endpoints for AI-powered features and task assistance.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..auth import get_current_active_user
from ..ai import (
    generate_task_description, 
    TaskDescriptionRequest, 
    TaskDescriptionResponse,
    AIError,
    get_ai_client
)
from ..ai.client import test_ai_connection, is_ai_available
from ..ai.task_description import generate_fallback_description

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.get("/status", 
    summary="AI Service Status",
    description="Check if AI service is available and configured"
)
async def get_ai_status(current_user: User = Depends(get_current_active_user)):
    """
    Check AI service availability and status.
    
    Returns:
        AI service status and configuration details
    """
    status_info = await test_ai_connection()
    return status_info


@router.post("/suggest/task-description",
    response_model=TaskDescriptionResponse,
    summary="Generate Task Description",
    description="Generate detailed task description with AI assistance",
    responses={
        200: {"description": "Task description generated successfully"},
        400: {"description": "Invalid request parameters"},
        503: {"description": "AI service unavailable, fallback response provided"}
    }
)
async def suggest_task_description(
    request: TaskDescriptionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate detailed task description using AI.
    
    Takes a basic task title and optional context, then generates:
    - Comprehensive description
    - Acceptance criteria
    - Technical notes
    - Time estimates
    - Relevant tags
    
    If AI service is unavailable, provides a fallback response.
    """
    try:
        # Try AI generation first
        if is_ai_available():
            response = generate_task_description(request)
            return response
        else:
            # Fallback when AI is not available
            response = generate_fallback_description(
                title=request.title,
                context=request.context
            )
            return response
            
    except AIError as e:
        # AI failed, provide fallback
        response = generate_fallback_description(
            title=request.title,
            context=request.context
        )
        # Still return 200 but indicate it's a fallback
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task description generation failed: {str(e)}"
        )


@router.post("/suggest/task-title",
    summary="Suggest Task Titles",
    description="Generate task title suggestions based on project context"
)
async def suggest_task_titles(
    context: str,
    project_type: Optional[str] = "web_application",
    count: int = 5,
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate task title suggestions based on context.
    
    Args:
        context: Project or feature context
        project_type: Type of project
        count: Number of suggestions to generate (1-10)
        
    Returns:
        List of suggested task titles
    """
    if not is_ai_available():
        return {
            "suggestions": [
                f"Implement {context}",
                f"Design {context}",
                f"Test {context}",
                f"Document {context}",
                f"Optimize {context}"
            ][:count],
            "ai_generated": False
        }
    
    client = get_ai_client()
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a software engineering assistant. Generate concise, actionable task titles for engineering work. Respond with a JSON array of strings."
                },
                {
                    "role": "user", 
                    "content": f"Generate {count} specific task titles for: {context} (Project type: {project_type}). Return as JSON array of strings."
                }
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        import json
        suggestions = json.loads(response.choices[0].message.content.strip())
        
        return {
            "suggestions": suggestions[:count],
            "ai_generated": True
        }
        
    except Exception as e:
        # Fallback suggestions
        return {
            "suggestions": [
                f"Implement {context}",
                f"Design {context}",
                f"Test {context}",
                f"Document {context}",
                f"Optimize {context}"
            ][:count],
            "ai_generated": False,
            "error": str(e)
        }