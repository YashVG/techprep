"""
Input sanitization utilities.

This module provides functions for sanitizing user inputs to prevent
XSS attacks, SQL injection, and other security vulnerabilities.
"""

import bleach
from typing import List, Optional


# Allowed HTML tags for content (very restrictive)
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a'
]

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'code': ['class'],
    'pre': ['class']
}

# Allowed protocols for links
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(text: str, allowed_tags: Optional[List[str]] = None,
                  allowed_attributes: Optional[dict] = None) -> str:
    """
    Sanitize HTML content to prevent XSS attacks.
    
    This function strips out dangerous HTML tags and attributes while
    preserving safe formatting.
    
    Args:
        text: The HTML text to sanitize
        allowed_tags: List of allowed HTML tags (uses default if None)
        allowed_attributes: Dict of allowed attributes per tag (uses default if None)
        
    Returns:
        Sanitized HTML string
    """
    if not text:
        return ""
    
    tags = allowed_tags if allowed_tags is not None else ALLOWED_TAGS
    attrs = allowed_attributes if allowed_attributes is not None else ALLOWED_ATTRIBUTES
    
    # Clean the HTML
    cleaned = bleach.clean(
        text,
        tags=tags,
        attributes=attrs,
        protocols=ALLOWED_PROTOCOLS,
        strip=True
    )
    
    return cleaned


def sanitize_plain_text(text: str) -> str:
    """
    Sanitize plain text by removing all HTML tags.
    
    Use this for fields that should not contain any HTML formatting,
    such as usernames, email addresses, or plain text comments.
    
    Args:
        text: The text to sanitize
        
    Returns:
        Text with all HTML removed
    """
    if not text:
        return ""
    
    # Remove all HTML tags
    cleaned = bleach.clean(text, tags=[], strip=True)
    
    return cleaned.strip()


def sanitize_code(code: str) -> str:
    """
    Sanitize code snippets.
    
    Code should be displayed as-is but escaped to prevent execution.
    This function escapes HTML entities.
    
    Args:
        code: The code string to sanitize
        
    Returns:
        Escaped code string
    """
    if not code:
        return ""
    
    # Just escape HTML entities, don't remove anything
    # bleach.clean with no tags will escape everything
    return bleach.clean(code, tags=[], strip=False)


def sanitize_user_input(data: dict, fields_config: dict) -> dict:
    """
    Sanitize multiple fields in a dictionary based on their types.
    
    Args:
        data: Dictionary of input data
        fields_config: Configuration dict specifying sanitization type for each field
                      Example: {'username': 'plain', 'content': 'html', 'code': 'code'}
                      
    Returns:
        Dictionary with sanitized values
    """
    sanitized = {}
    
    for field, value in data.items():
        if field not in fields_config:
            # If not configured, treat as plain text by default
            sanitized[field] = sanitize_plain_text(str(value)) if value else value
            continue
        
        field_type = fields_config[field]
        
        if value is None:
            sanitized[field] = None
        elif field_type == 'html':
            sanitized[field] = sanitize_html(str(value))
        elif field_type == 'code':
            sanitized[field] = sanitize_code(str(value))
        elif field_type == 'plain':
            sanitized[field] = sanitize_plain_text(str(value))
        else:
            # Default to plain text
            sanitized[field] = sanitize_plain_text(str(value))
    
    return sanitized

