"""
Core configuration settings for SprintSync API

Handles environment variables, database configuration, and other app settings.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    app_name: str = "SprintSync API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Environment
    environment: str = "development"
    
    # Database settings
    database_url: Optional[str] = None
    cloud_sql_instance: Optional[str] = None
    
    # JWT settings
    secret_key: str = "your-super-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI settings
    openai_api_key: Optional[str] = None
    
    # CORS settings
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra fields that might be passed during initialization
        extra = "allow"


# Global settings instance
settings = Settings()