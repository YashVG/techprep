"""
Routes Package
Exports all route blueprints for the application
"""

from .auth_routes import auth_bp
from .post_routes import posts_bp
from .comment_routes import comments_bp
from .course_routes import courses_bp
from .user_routes import users_bp
from .group_routes import groups_bp

__all__ = [
    'auth_bp',
    'posts_bp',
    'comments_bp',
    'courses_bp',
    'users_bp',
    'groups_bp'
]

