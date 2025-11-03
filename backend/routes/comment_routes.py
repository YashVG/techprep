"""
Comment Routes
Handles comment creation and retrieval
"""

from flask import Blueprint, request, jsonify, g

from models import db, Post, Comment
from decorators import login_required
from utils.validation import validate_string_length
from utils.sanitization import sanitize_html
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Create blueprint
comments_bp = Blueprint('comments', __name__, url_prefix='/comments')


@comments_bp.route("", methods=["POST"])
@login_required
def add_comment():
    """
    Adds a comment to a post.

    Requires authentication. Accepts JSON with 'content' and 'post_id'.
    Returns the created comment data.
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['content', 'post_id']):
            return jsonify({"error": "Content and post_id are required"}), 400
        
        post = Post.query.get_or_404(data["post_id"])
        
        # Sanitize and validate content
        content = sanitize_html(data["content"])  # Allow some HTML in comments
        is_valid, message = validate_string_length(content, min_length=1, max_length=5000, field_name="Comment")
        if not is_valid:
            return jsonify({"error": message}), 400
        
        comment = Comment(
            content=content,
            user_id=g.current_user.id,
            post_id=data["post_id"]
        )
        db.session.add(comment)
        db.session.commit()
        
        logger.info(f"Comment added by user {g.current_user.id} on post {data['post_id']}")
        
        return jsonify({
            "message": "Comment added",
            "id": comment.id,
            "user": g.current_user.username,
            "post_id": comment.post_id,
            "content": comment.content,
            "created_at": comment.created_at.isoformat() if comment.created_at else None
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Comment creation error: {str(e)}")
        return jsonify({"error": "Failed to add comment"}), 500

