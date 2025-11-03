"""
Decorators Module
Common decorators used across the application
"""

from flask import request, jsonify, g
from functools import wraps
from models import User
from utils.logger import log_security_event, setup_logger

logger = setup_logger(__name__)

def login_required(f):
    """
    Decorator to require authentication for protected routes.
    
    This decorator validates the JWT token from the Authorization header
    and sets g.current_user to the authenticated user.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            log_security_event(logger, 'missing_auth_token')
            return jsonify({"error": "Authorization token required"}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        user = User.verify_token(token)
        if not user:
            log_security_event(logger, 'invalid_token')
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Set current user in Flask g object for use in route handlers
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

