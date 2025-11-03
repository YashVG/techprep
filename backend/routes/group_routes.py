"""
Group Routes
Handles group management, member operations, and group posts
"""

from flask import Blueprint, request, jsonify, g

from models import db, Group, User, Post
from decorators import login_required
from utils.validation import validate_string_length
from utils.sanitization import sanitize_html, sanitize_plain_text
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Create blueprint
groups_bp = Blueprint('groups', __name__, url_prefix='/groups')


@groups_bp.route("", methods=["GET"])
def get_groups():
    """
    Fetches all groups.
    
    Returns a list of group dictionaries.
    """
    groups = Group.query.all()
    return jsonify([group.to_dict() for group in groups])


@groups_bp.route("", methods=["POST"])
@login_required
def create_group():
    """
    Creates a new group.
    
    Requires authentication. Accepts JSON with 'name' and optional 'description'.
    The creator is automatically added as a member.
    Returns the created group data.
    """
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({"error": "Group name is required"}), 400
        
        # Sanitize and validate inputs
        name = sanitize_plain_text(data['name'])
        description = sanitize_html(data.get('description', '')) if data.get('description') else None
        
        # Validate name length
        is_valid, message = validate_string_length(name, min_length=1, max_length=100, field_name="Group name")
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Validate description length if provided
        if description:
            is_valid, message = validate_string_length(description, min_length=0, max_length=1000, field_name="Description")
            if not is_valid:
                return jsonify({"error": message}), 400
        
        # Create group
        group = Group(
            name=name,
            creator_id=g.current_user.id,
            description=description
        )
        
        # Add creator as a member
        group.members.append(g.current_user)
        
        db.session.add(group)
        db.session.commit()
        
        logger.info(f"Group created by user {g.current_user.id}: Group ID {group.id}")
        
        return jsonify({
            "message": "Group created successfully",
            "group": group.to_dict(include_members=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Group creation error: {str(e)}")
        return jsonify({"error": "Failed to create group"}), 500


@groups_bp.route("/<int:group_id>", methods=["GET"])
def get_group(group_id):
    """
    Fetches a specific group with its members.
    
    Returns group details including member list.
    """
    group = Group.query.get_or_404(group_id)
    return jsonify(group.to_dict(include_members=True))


@groups_bp.route("/<int:group_id>", methods=["PUT"])
@login_required
def update_group(group_id):
    """
    Updates a group's information.
    
    Requires authentication. Only the group creator can update the group.
    Accepts JSON with optional 'name' and 'description'.
    Returns updated group data.
    """
    try:
        group = Group.query.get_or_404(group_id)
        
        # Check if user is the creator
        if group.creator_id != g.current_user.id:
            return jsonify({"error": "Only the group creator can update the group"}), 403
        
        data = request.get_json()
        
        if 'name' in data:
            name = sanitize_plain_text(data['name'])
            is_valid, message = validate_string_length(name, min_length=1, max_length=100, field_name="Group name")
            if not is_valid:
                return jsonify({"error": message}), 400
            group.name = name
        
        if 'description' in data:
            description = sanitize_html(data['description']) if data['description'] else None
            if description:
                is_valid, message = validate_string_length(description, min_length=0, max_length=1000, field_name="Description")
                if not is_valid:
                    return jsonify({"error": message}), 400
            group.description = description
        
        db.session.commit()
        
        logger.info(f"Group {group_id} updated by user {g.current_user.id}")
        
        return jsonify({
            "message": "Group updated successfully",
            "group": group.to_dict(include_members=True)
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Group update error: {str(e)}")
        return jsonify({"error": "Failed to update group"}), 500


@groups_bp.route("/<int:group_id>", methods=["DELETE"])
@login_required
def delete_group(group_id):
    """
    Deletes a group.
    
    Requires authentication. Only the group creator can delete the group.
    Returns a confirmation message upon successful deletion.
    """
    try:
        group = Group.query.get_or_404(group_id)
        
        # Check if user is the creator
        if group.creator_id != g.current_user.id:
            return jsonify({"error": "Only the group creator can delete the group"}), 403
        
        db.session.delete(group)
        db.session.commit()
        
        logger.info(f"Group {group_id} deleted by user {g.current_user.id}")
        
        return jsonify({"message": "Group deleted successfully"})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Group deletion error: {str(e)}")
        return jsonify({"error": "Failed to delete group"}), 500


@groups_bp.route("/<int:group_id>/members", methods=["POST"])
@login_required
def add_group_member(group_id):
    """
    Adds a member to a group.
    
    Requires authentication. Only group creator or the user themselves can add members.
    Accepts JSON with 'user_id' to add a specific user.
    If no user_id provided, adds the current user to the group.
    Returns updated group data.
    """
    try:
        group = Group.query.get_or_404(group_id)
        data = request.get_json()
        
        # Determine which user to add
        if data and 'user_id' in data:
            # Adding another user (only creator can do this)
            if group.creator_id != g.current_user.id:
                return jsonify({"error": "Only the group creator can add other members"}), 403
            
            user_to_add = User.query.get_or_404(data['user_id'])
        else:
            # Adding self (any authenticated user can do this)
            user_to_add = g.current_user
        
        # Check if user is already a member
        if group.members.filter_by(id=user_to_add.id).first():
            return jsonify({"error": "User is already a member of this group"}), 400
        
        # Add member
        group.members.append(user_to_add)
        db.session.commit()
        
        logger.info(f"User {user_to_add.id} added to group {group_id}")
        
        return jsonify({
            "message": "Member added successfully",
            "group": group.to_dict(include_members=True)
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Add member error: {str(e)}")
        return jsonify({"error": "Failed to add member"}), 500


@groups_bp.route("/<int:group_id>/members/<int:user_id>", methods=["DELETE"])
@login_required
def remove_group_member(group_id, user_id):
    """
    Removes a member from a group.
    
    Requires authentication. Group creator can remove any member.
    Users can remove themselves from the group.
    Returns updated group data.
    """
    try:
        group = Group.query.get_or_404(group_id)
        user_to_remove = User.query.get_or_404(user_id)
        
        # Check permissions
        if g.current_user.id != group.creator_id and g.current_user.id != user_id:
            return jsonify({"error": "You can only remove yourself or you must be the group creator"}), 403
        
        # Prevent creator from removing themselves if they're the only member
        if user_id == group.creator_id and group.members.count() > 1:
            return jsonify({"error": "Group creator cannot leave while other members exist. Transfer ownership or delete the group."}), 400
        
        # Check if user is a member
        if not group.members.filter_by(id=user_id).first():
            return jsonify({"error": "User is not a member of this group"}), 400
        
        # Remove member
        group.members.remove(user_to_remove)
        db.session.commit()
        
        logger.info(f"User {user_id} removed from group {group_id}")
        
        return jsonify({
            "message": "Member removed successfully",
            "group": group.to_dict(include_members=True)
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Remove member error: {str(e)}")
        return jsonify({"error": "Failed to remove member"}), 500


@groups_bp.route("/<int:group_id>/posts", methods=["GET"])
@login_required
def get_group_posts(group_id):
    """
    Get all posts for a specific group.
    
    Only group members can view group posts.
    Returns list of posts with full details.
    """
    try:
        # Get the group
        group = Group.query.get_or_404(group_id)
        
        # Check if user is a member
        is_member = group.members.filter_by(id=g.current_user.id).first() is not None
        
        if not is_member:
            return jsonify({"error": "You must be a member of this group to view its posts"}), 403
        
        # Get all posts for this group
        posts = Post.query.filter_by(group_id=group_id).order_by(Post.created_at.desc()).all()
        
        posts_list = [{
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "author": p.author.username,
            "author_id": p.author.id,
            "tags": p.tags,
            "course": p.course,
            "code": p.code,
            "group_id": p.group_id,
            "group_name": group.name,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        } for p in posts]
        
        logger.info(f"User {g.current_user.id} fetched {len(posts_list)} posts from group {group_id}")
        
        return jsonify({
            "group_id": group_id,
            "group_name": group.name,
            "posts": posts_list
        })
        
    except Exception as e:
        logger.error(f"Error fetching group posts: {str(e)}")
        return jsonify({"error": "Failed to fetch group posts"}), 500

