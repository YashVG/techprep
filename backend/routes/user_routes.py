"""
User Routes
Handles user-related operations and user posts
"""

from flask import Blueprint, jsonify

from models import User

# Create blueprint
users_bp = Blueprint('users', __name__, url_prefix='/users')


@users_bp.route("", methods=["GET"])
def get_users():
    """
    Fetches all users and their posts.

    Returns a list of user dictionaries including post summaries (with code field).
    """
    users = User.query.all()
    result = []
    for u in users:
        user_data = {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "posts": [
                {
                    "id": p.id,
                    "title": p.title,
                    "content": p.content,
                    "tags": p.tags,
                    "course": p.course,
                    "code": p.code
                }
                for p in u.posts
            ]
        }
        result.append(user_data)
    return jsonify(result)


@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """
    Fetches a specific user and their posts.

    Returns user details and a list of their posts by user ID (with code field).
    """
    user = User.query.get_or_404(user_id)
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "posts": [
            {
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "tags": p.tags,
                "course": p.course,
                "code": p.code
            }
            for p in user.posts
        ]
    }
    return jsonify(user_data)


@users_bp.route("/<int:user_id>/posts", methods=["GET"])
def get_user_posts(user_id):
    """
    Fetches all posts for a specific user.
    
    Returns a list of posts with full details including timestamps.
    """
    user = User.query.get_or_404(user_id)
    posts = user.posts
    return jsonify([{
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tags": post.tags,
        "course": post.course,
        "code": post.code,
        "user_id": post.user_id,
        "author": post.author.username if post.author else None,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None
    } for post in posts])


@users_bp.route("/<int:user_id>/groups", methods=["GET"])
def get_user_groups(user_id):
    """
    Fetches all groups a specific user is a member of.
    
    Returns a list of group dictionaries.
    """
    user = User.query.get_or_404(user_id)
    return jsonify([group.to_dict() for group in user.groups])

