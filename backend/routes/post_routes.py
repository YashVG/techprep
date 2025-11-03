"""
Post Routes
Handles blog post CRUD operations including group-specific posts
"""

from flask import Blueprint, request, jsonify, g

from models import db, Post, Group
from decorators import login_required
from utils.validation import validate_string_length
from utils.sanitization import sanitize_html, sanitize_plain_text, sanitize_code
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Create blueprint
posts_bp = Blueprint('posts', __name__, url_prefix='/posts')


@posts_bp.route("", methods=["GET"])
def get_posts():
    """
    Fetches all blog posts that the user has access to.
    
    - Public posts (group_id is None) are visible to everyone
    - Group posts are only visible to group members
    - Returns filtered list based on user's group memberships
    """
    from flask import request
    from decorators import login_required
    
    # Get authentication token if present
    token = request.headers.get('Authorization')
    current_user = None
    
    if token:
        if token.startswith('Bearer '):
            token = token[7:]
        from models import User
        current_user = User.verify_token(token)
    
    # Get all posts
    all_posts = Post.query.all()
    accessible_posts = []
    
    for p in all_posts:
        # Public posts (no group) are visible to everyone
        if p.group_id is None:
            accessible_posts.append({
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "author": p.author.username,
                "tags": p.tags,
                "course": p.course,
                "code": p.code,
                "group_id": None,
                "group_name": None
            })
        # Group posts are only visible to members
        elif current_user and p.group:
            # Check if user is a member of the group
            is_member = p.group.members.filter_by(id=current_user.id).first() is not None
            if is_member:
                accessible_posts.append({
                    "id": p.id,
                    "title": p.title,
                    "content": p.content,
                    "author": p.author.username,
                    "tags": p.tags,
                    "course": p.course,
                    "code": p.code,
                    "group_id": p.group_id,
                    "group_name": p.group.name
                })
    
    return jsonify(accessible_posts)


@posts_bp.route("", methods=["POST"])
@login_required
def add_post():
    """
    Creates a new blog post.

    Requires authentication. Accepts JSON with 'title', 'content', optional 'tags', 'course', 'code', and 'group_id'.
    If group_id is provided, the post is only visible to group members.
    Returns the ID of the created post.
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['title', 'content']):
            return jsonify({"error": "Title and content are required"}), 400
        
        # Sanitize and validate inputs
        title = sanitize_plain_text(data["title"])
        content = sanitize_html(data["content"])  # Allow some HTML formatting in content
        code = sanitize_code(data.get("code", "")) if data.get("code") else None
        
        # Validate title length
        is_valid, message = validate_string_length(title, min_length=1, max_length=200, field_name="Title")
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Validate content length
        is_valid, message = validate_string_length(content, min_length=1, max_length=50000, field_name="Content")
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Sanitize tags
        tags = []
        if data.get("tags"):
            tags = [sanitize_plain_text(tag) for tag in data.get("tags", [])]
        
        # Sanitize course
        course = sanitize_plain_text(data.get("course", "")) if data.get("course") else None
        
        # Handle group_id if provided
        group_id = data.get("group_id")
        if group_id:
            # Verify group exists
            group = Group.query.get(group_id)
            if not group:
                return jsonify({"error": "Group not found"}), 404
            
            # Verify user is a member of the group
            is_member = group.members.filter_by(id=g.current_user.id).first() is not None
            if not is_member:
                return jsonify({"error": "You must be a member of the group to post in it"}), 403
        
        post = Post(
            title=title,
            content=content,
            user_id=g.current_user.id,
            tags=tags,
            course=course,
            code=code,
            group_id=group_id
        )
        db.session.add(post)
        db.session.commit()
        
        logger.info(f"Post created by user {g.current_user.id}: Post ID {post.id}" + 
                   (f" in group {group_id}" if group_id else " (public)"))
        
        return jsonify({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author": g.current_user.username,
            "tags": post.tags,
            "course": post.course,
            "code": post.code,
            "group_id": post.group_id,
            "group_name": post.group.name if post.group else None
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Post creation error: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500


@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id):
    """
    Deletes a post by ID.

    Requires authentication. Users can only delete their own posts.
    Returns a confirmation message upon successful deletion.
    """
    post = Post.query.get_or_404(post_id)
    
    # Check if user owns the post
    if post.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized to delete this post"}), 403
    
    db.session.delete(post)
    db.session.commit()
    
    logger.info(f"Post {post_id} deleted by user {g.current_user.id}")
    
    return jsonify({"message": "Post deleted"})


@posts_bp.route("/<int:post_id>/comments", methods=["GET"])
def get_post_comments(post_id):
    """
    Fetches all comments for a specific post.

    Returns a list of comment dictionaries with id, content, user, and post_id.
    """
    post = Post.query.get_or_404(post_id)
    return jsonify([{
        "id": c.id,
        "content": c.content,
        "user": c.author.username,
        "post_id": c.post_id
    } for c in post.comments])

