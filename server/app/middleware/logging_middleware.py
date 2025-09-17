"""
Logging middleware for structured API request/response logging.

Provides comprehensive logging of all API calls with request/response details
and error tracking for monitoring and debugging purposes.
"""

import time
import logging
import logging.handlers
import json
from typing import Callable, Awaitable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime, timezone
import uuid
import os


# Configure structured logger
logger = logging.getLogger("sprintsync.api")
logger.setLevel(logging.INFO)

# Create logs directory if it doesn't exist
logs_dir = "logs"
if not os.path.exists(logs_dir):
    try:
        os.makedirs(logs_dir)
    except Exception:
        # If we can't create logs directory, continue with console logging only
        pass

# Create file handler with formatting
file_handler = logging.handlers.RotatingFileHandler(
    filename=os.path.join(logs_dir, "sprintsync_api.log"),
    maxBytes=10485760,  # 10MB
    backupCount=5,
)

# Create console handler with formatting
console_handler = logging.StreamHandler()

# Set formatters
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add handlers to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured logging of API requests and responses."""
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """
        Process request and log details before and after handling.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain
            
        Returns:
            HTTP response
        """
        # Generate unique request ID for tracking
        request_id = str(uuid.uuid4())
        
        # Record start time
        start_time = time.time()
        
        # Extract request details
        request_details = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": dict(request.headers),
            "client_ip": self._get_client_ip(request),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        # Try to extract request body for logging (safely)
        try:
            if request.method in ["POST", "PUT", "PATCH"]:
                # Save body for later use since it can only be read once
                body_bytes = await request.body()
                request_details["body_size"] = len(body_bytes)
                # Only log body for small requests to avoid logging large payloads
                if len(body_bytes) < 1024:  # Less than 1KB
                    try:
                        request_details["body"] = body_bytes.decode("utf-8")
                    except UnicodeDecodeError:
                        request_details["body"] = "[Binary data]"
            else:
                request_details["body_size"] = 0
        except Exception as e:
            request_details["body_error"] = str(e)
        
        # Log incoming request
        logger.info(f"API Request: {json.dumps(request_details)}")
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Extract response details
            response_details = {
                "request_id": request_id,
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "process_time_ms": round(process_time * 1000, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            # Try to log response body for JSON responses (safely)
            try:
                if hasattr(response, 'body') and len(response.body) < 1024:
                    response_details["body_size"] = len(response.body)
                    # Only log small responses
                    try:
                        response_details["body"] = response.body.decode("utf-8")
                    except UnicodeDecodeError:
                        response_details["body"] = "[Binary data]"
                else:
                    # For streaming responses, we can't easily access the body
                    response_details["body_size"] = getattr(response, 'headers', {}).get('content-length', 'unknown')
            except Exception as e:
                response_details["body_error"] = str(e)
            
            # Log successful response
            logger.info(f"API Response: {json.dumps(response_details)}")
            
            return response
            
        except StarletteHTTPException as e:
            # Handle HTTP exceptions (4xx, 5xx)
            process_time = time.time() - start_time
            
            error_details = {
                "request_id": request_id,
                "status_code": e.status_code,
                "detail": str(e.detail),
                "process_time_ms": round(process_time * 1000, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "exception_type": "HTTPException",
            }
            
            logger.warning(f"API HTTP Error: {json.dumps(error_details)}")
            
            # Re-raise the exception
            raise e
            
        except Exception as e:
            # Handle unexpected exceptions
            process_time = time.time() - start_time
            
            error_details = {
                "request_id": request_id,
                "status_code": 500,
                "error_type": type(e).__name__,
                "error_message": str(e),
                "process_time_ms": round(process_time * 1000, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "exception_type": "UnexpectedError",
            }
            
            logger.error(f"API Internal Error: {json.dumps(error_details)}", exc_info=True)
            
            # Return a generic error response
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.
        
        Args:
            request: HTTP request
            
        Returns:
            Client IP address
        """
        # Check for forwarded headers (from proxies/load balancers)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Get first IP in the chain (client IP)
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        if request.client:
            return request.client.host
            
        return "unknown"


# Custom formatter for structured logging
class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging."""
    
    def format(self, record):
        """Format log record as structured JSON."""
        # Create base log entry
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields if present
        if hasattr(record, 'request'):
            log_entry['request'] = record.request
        if hasattr(record, 'response'):
            log_entry['response'] = record.response
        if hasattr(record, 'error'):
            log_entry['error'] = record.error
            
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)