"""
Logging utilities for the application.

This module provides centralized logging configuration and helper
functions for logging security events, errors, and general application events.
"""

import logging
import os
from datetime import datetime
from typing import Optional
from flask import request, has_request_context
from functools import wraps


def setup_logger(name: str, log_file: str = 'app.log', level: str = 'INFO') -> logging.Logger:
    """
    Set up and configure a logger.
    
    Args:
        name: Name of the logger (usually __name__)
        log_file: Path to log file
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_formatter = logging.Formatter(
        '%(levelname)s: %(message)s'
    )
    
    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    return logger


def get_request_info() -> dict:
    """
    Get information about the current request.
    
    Returns:
        Dictionary with request information (IP, method, path, etc.)
    """
    if not has_request_context():
        return {}
    
    return {
        'ip': request.remote_addr,
        'method': request.method,
        'path': request.path,
        'user_agent': request.headers.get('User-Agent', 'Unknown')
    }


def log_security_event(logger: logging.Logger, event_type: str, 
                       user_id: Optional[int] = None, details: Optional[str] = None):
    """
    Log a security-related event.
    
    Args:
        logger: Logger instance
        event_type: Type of security event (e.g., 'login_failed', 'unauthorized_access')
        user_id: ID of the user involved (if applicable)
        details: Additional details about the event
    """
    request_info = get_request_info()
    
    log_message = f"SECURITY EVENT: {event_type}"
    if user_id:
        log_message += f" | User ID: {user_id}"
    if details:
        log_message += f" | Details: {details}"
    
    log_message += f" | IP: {request_info.get('ip', 'Unknown')}"
    log_message += f" | Path: {request_info.get('path', 'Unknown')}"
    
    logger.warning(log_message)


def log_api_call(logger: logging.Logger):
    """
    Decorator to log API calls.
    
    Args:
        logger: Logger instance
        
    Returns:
        Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            request_info = get_request_info()
            logger.info(
                f"API Call: {request_info.get('method')} {request_info.get('path')} "
                f"from {request_info.get('ip')}"
            )
            
            try:
                result = f(*args, **kwargs)
                return result
            except Exception as e:
                logger.error(
                    f"Error in {f.__name__}: {str(e)} | "
                    f"Path: {request_info.get('path')} | "
                    f"IP: {request_info.get('ip')}"
                )
                raise
        
        return decorated_function
    return decorator

