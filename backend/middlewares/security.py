"""
Security middleware for Flask application.

This module provides middleware functions for adding security headers,
CORS configuration, and other security-related functionality.
"""

from flask import Flask, Response
from typing import Optional


def add_security_headers(response: Response) -> Response:
    """
    Add security headers to all responses.
    
    Headers added:
    - X-Content-Type-Options: Prevent MIME type sniffing
    - X-Frame-Options: Prevent clickjacking
    - X-XSS-Protection: Enable browser XSS protection
    - Content-Security-Policy: Restrict resource loading
    - Strict-Transport-Security: Enforce HTTPS
    
    Args:
        response: Flask response object
        
    Returns:
        Response with security headers added
    """
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # Enable XSS protection (legacy browsers)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Content Security Policy - adjust based on your needs
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self'"
    )
    
    # Strict Transport Security (HSTS) - only enable if using HTTPS
    # Uncomment in production with HTTPS:
    # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response


def configure_security_middleware(app: Flask) -> None:
    """
    Configure security middleware for the Flask application.
    
    This function registers the after_request handler to add security
    headers to all responses.
    
    Args:
        app: Flask application instance
    """
    @app.after_request
    def apply_security_headers(response):
        return add_security_headers(response)
    
    @app.before_request
    def log_request_info():
        """Log basic request information for monitoring."""
        # This can be extended to log more details if needed
        pass

