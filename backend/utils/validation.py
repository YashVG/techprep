"""
Input validation utilities.

This module provides functions for validating user inputs including
passwords, emails, usernames, and other data formats.
"""

import re
from typing import Tuple


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password strength.
    
    Requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one number
    
    Args:
        password: The password string to validate
        
    Returns:
        A tuple of (is_valid, message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    return True, "Password is valid"


def validate_email(email: str) -> Tuple[bool, str]:
    """
    Validate email format.
    
    Args:
        email: The email string to validate
        
    Returns:
        A tuple of (is_valid, message)
    """
    if not email:
        return False, "Email is required"
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    if len(email) > 120:
        return False, "Email is too long (max 120 characters)"
    
    return True, "Email is valid"


def validate_username(username: str) -> Tuple[bool, str]:
    """
    Validate username format.
    
    Requirements:
    - Alphanumeric characters and underscores only
    - Between 3 and 80 characters
    
    Args:
        username: The username string to validate
        
    Returns:
        A tuple of (is_valid, message)
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 80:
        return False, "Username is too long (max 80 characters)"
    
    username_pattern = r'^[a-zA-Z0-9_]+$'
    if not re.match(username_pattern, username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, "Username is valid"


def validate_course_code(code: str) -> Tuple[bool, str]:
    """
    Validate course code format.
    
    Requirements:
    - Alphanumeric characters only
    - Between 3 and 10 characters
    
    Args:
        code: The course code string to validate
        
    Returns:
        A tuple of (is_valid, message)
    """
    if not code:
        return False, "Course code is required"
    
    code_pattern = r'^[A-Za-z0-9]{3,10}$'
    if not re.match(code_pattern, code):
        return False, "Course code must be 3-10 alphanumeric characters"
    
    return True, "Course code is valid"


def validate_string_length(text: str, min_length: int = 1, max_length: int = 10000, 
                          field_name: str = "Field") -> Tuple[bool, str]:
    """
    Validate string length constraints.
    
    Args:
        text: The text to validate
        min_length: Minimum allowed length
        max_length: Maximum allowed length
        field_name: Name of the field for error messages
        
    Returns:
        A tuple of (is_valid, message)
    """
    if not text:
        return False, f"{field_name} is required"
    
    if len(text) < min_length:
        return False, f"{field_name} must be at least {min_length} characters"
    
    if len(text) > max_length:
        return False, f"{field_name} must not exceed {max_length} characters"
    
    return True, f"{field_name} is valid"

