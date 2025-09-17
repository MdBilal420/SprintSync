"""
Logging configuration for SprintSync API.

Centralized logging configuration with different handlers for various
environments and log levels.
"""

import logging
import logging.config
import json
from typing import Dict, Any
from .config import settings


def get_logging_config() -> Dict[str, Any]:
    """
    Get logging configuration based on environment.
    
    Returns:
        Dictionary with logging configuration
    """
    # Base configuration
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s"
            },
            "json": {
                "()": "app.middleware.logging_middleware.StructuredFormatter",
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "json",
                "stream": "ext://sys.stdout"
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": "logs/sprintsync.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            }
        },
        "loggers": {
            "": {  # root logger
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "sprintsync": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "sprintsync.api": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            }
        }
    }
    
    # Add file handler in production
    if settings.environment == "production":
        config["loggers"]["sprintsync"]["handlers"].append("file")
        config["loggers"]["sprintsync.api"]["handlers"].append("file")
    
    return config


def setup_logging():
    """Setup logging configuration."""
    try:
        # Create logs directory if it doesn't exist
        import os
        logs_dir = "logs"
        if not os.path.exists(logs_dir):
            os.makedirs(logs_dir)
    except Exception:
        # If we can't create logs directory, continue with console logging only
        pass
    
    # Apply logging configuration
    logging_config = get_logging_config()
    logging.config.dictConfig(logging_config)