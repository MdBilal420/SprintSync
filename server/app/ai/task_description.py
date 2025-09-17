"""
Task description generation using AI.

Provides intelligent task description generation for engineering tasks.
"""

import json
from typing import Optional
from pydantic import BaseModel, Field

from .client import get_ai_client, AIError


class TaskDescriptionRequest(BaseModel):
    """Request schema for task description generation."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    context: Optional[str] = Field(None, max_length=1000, description="Additional context or requirements")
    project_type: Optional[str] = Field("web_application", description="Type of project (web_application, mobile_app, api, etc.)")
    complexity: Optional[str] = Field("medium", description="Expected complexity (low, medium, high)")


class TaskDescriptionResponse(BaseModel):
    """Response schema for generated task description."""
    title: str
    description: str
    acceptance_criteria: list[str]
    technical_notes: list[str]
    estimated_hours: Optional[float] = None
    tags: list[str] = []
    ai_generated: bool = True


def generate_task_description(request: TaskDescriptionRequest) -> TaskDescriptionResponse:
    """
    Generate detailed task description using AI.
    
    Args:
        request: Task description request with title and optional context
        
    Returns:
        TaskDescriptionResponse with generated description and details
        
    Raises:
        AIError: If AI service is unavailable or generation fails
    """
    client = get_ai_client()
    
    if not client:
        raise AIError("AI service not available. Please configure OPENAI_API_KEY.")
    
    # Build the prompt for task description generation
    prompt = build_task_description_prompt(request)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert software engineering assistant specializing in task planning and project management. 
                    Your role is to help engineers create comprehensive, actionable task descriptions.
                    
                    Always respond with valid JSON that matches the required schema exactly.
                    Focus on practical, implementable details that help engineers understand exactly what needs to be done."""
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3,  # Lower temperature for more consistent, focused responses
            response_format={"type": "json_object"}
        )
        
        # Parse the AI response
        ai_content = response.choices[0].message.content.strip()
        parsed_response = json.loads(ai_content)
        
        # Validate and create response object
        return TaskDescriptionResponse(
            title=request.title,
            description=parsed_response.get("description", ""),
            acceptance_criteria=parsed_response.get("acceptance_criteria", []),
            technical_notes=parsed_response.get("technical_notes", []),
            estimated_hours=parsed_response.get("estimated_hours"),
            tags=parsed_response.get("tags", []),
            ai_generated=True
        )
        
    except json.JSONDecodeError as e:
        raise AIError(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise AIError(f"AI task description generation failed: {str(e)}")


def build_task_description_prompt(request: TaskDescriptionRequest) -> str:
    """
    Build the prompt for AI task description generation.
    
    Args:
        request: Task description request
        
    Returns:
        Formatted prompt string
    """
    # Build prompt without f-string in triple quotes to avoid syntax issues
    prompt = "Generate a comprehensive task description for a software engineering task.\n\n"
    prompt += f"Task Title: {request.title}\n"
    prompt += f"Project Type: {request.project_type}\n"
    prompt += f"Complexity: {request.complexity}\n"
    
    if request.context:
        prompt += f"Additional Context: {request.context}\n"
    
    prompt += """
Please provide a JSON response with the following structure:
{
    "description": "Detailed description of what needs to be implemented, including the why and how",
    "acceptance_criteria": ["List of 3-5 specific, measurable criteria that define when this task is complete"],
    "technical_notes": ["List of 2-4 technical considerations, implementation details, or potential challenges"],
    "estimated_hours": 2.5,
    "tags": ["List of 2-5 relevant tags like 'frontend', 'backend', 'api', 'database', etc."]
}

Focus on:
- Clear, actionable descriptions
- Specific acceptance criteria that can be tested
- Practical technical guidance
- Realistic time estimates
- Relevant categorization tags

Make sure the response is valid JSON and matches the schema exactly."""

    return prompt


def generate_fallback_description(title: str, context: Optional[str] = None) -> TaskDescriptionResponse:
    """
    Generate a fallback task description when AI is unavailable.
    
    Args:
        title: Task title
        context: Optional additional context
        
    Returns:
        Basic TaskDescriptionResponse without AI generation
    """
    description = f"Complete the task: {title}"
    if context:
        description += f"\n\nAdditional context: {context}"
    
    return TaskDescriptionResponse(
        title=title,
        description=description,
        acceptance_criteria=[
            "Task requirements are clearly defined",
            "Implementation is complete and tested",
            "Code review is completed",
            "Documentation is updated"
        ],
        technical_notes=[
            "Review existing codebase for similar implementations",
            "Follow project coding standards and best practices",
            "Consider performance and scalability implications"
        ],
        estimated_hours=2.0,
        tags=["task"],
        ai_generated=False
    )