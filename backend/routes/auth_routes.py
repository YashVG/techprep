"""
Authentication Routes
Handles user registration, login, logout, and profile management
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from models import db, User
from decorators import login_required
from utils.validation import validate_password, validate_email, validate_username
from utils.sanitization import sanitize_plain_text
from utils.logger import setup_logger, log_security_event

logger = setup_logger(__name__)

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Note: Rate limiting will be applied in main app.py using limiter.limit decorator


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user with password validation.

    Accepts JSON with 'username', 'email', and 'password'.
    Returns user data and JWT token upon successful registration.
    
    Rate limited to 5 attempts per hour per IP address.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['username', 'email', 'password']):
            return jsonify({"error": "Username, email, and password are required"}), 400
        
        # Sanitize inputs
        username = sanitize_plain_text(data['username'])
        email = sanitize_plain_text(data['email'])
        
        # Validate username
        is_valid, message = validate_username(username)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Validate email
        is_valid, message = validate_email(email)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Validate password strength
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Create user
        user = User(
            username=username, 
            email=email, 
            password=data["password"]
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = user.generate_token()
        
        logger.info(f"New user registered: {username} (ID: {user.id})")
        
        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict(),
            "token": token
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        log_security_event(logger, 'registration_duplicate', details=f"Username: {username}")
        return jsonify({"error": "Username or email already exists"}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT token.

    Accepts JSON with 'username' and 'password'.
    Returns user data and JWT token upon successful authentication.
    
    Rate limited to 10 attempts per minute per IP address.
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['username', 'password']):
            return jsonify({"error": "Username and password are required"}), 400
        
        # Sanitize username input
        username = sanitize_plain_text(data["username"])
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(data["password"]):
            log_security_event(logger, 'login_failed', details=f"Username: {username}")
            return jsonify({"error": "Invalid username or password"}), 401
        
        if not user.is_active:
            log_security_event(logger, 'login_inactive_account', user_id=user.id)
            return jsonify({"error": "Account is deactivated"}), 401
        
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = user.generate_token()
        
        logger.info(f"User logged in: {username} (ID: {user.id})")
        
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict(),
            "token": token
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    """
    Get current user's profile information.

    Requires valid JWT token in Authorization header.
    Returns user profile data.
    """
    return jsonify({
        "user": g.current_user.to_dict()
    })


@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    """
    Update current user's profile information.

    Requires valid JWT token in Authorization header.
    Accepts JSON with optional 'email' field.
    Returns updated user data.
    """
    try:
        data = request.get_json()
        
        if 'email' in data:
            # Sanitize and validate email
            email = sanitize_plain_text(data['email'])
            is_valid, message = validate_email(email)
            if not is_valid:
                return jsonify({"error": message}), 400
            
            try:
                g.current_user.email = email
                db.session.commit()
                logger.info(f"User {g.current_user.id} updated email")
            except IntegrityError:
                db.session.rollback()
                return jsonify({"error": "Email already exists"}), 400
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": g.current_user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Profile update error: {str(e)}")
        return jsonify({"error": "Failed to update profile"}), 500


@auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password():
    """
    Change current user's password.

    Requires valid JWT token in Authorization header.
    Accepts JSON with 'current_password' and 'new_password'.
    Returns success message.
    
    Rate limited to 3 attempts per hour per IP address.
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['current_password', 'new_password']):
            return jsonify({"error": "Current password and new password are required"}), 400
        
        # Verify current password
        if not g.current_user.check_password(data['current_password']):
            log_security_event(logger, 'password_change_failed', user_id=g.current_user.id)
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Validate new password strength
        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Set new password
        g.current_user.set_password(data['new_password'])
        db.session.commit()
        
        logger.info(f"User {g.current_user.id} changed password")
        
        return jsonify({"message": "Password changed successfully"})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Password change error: {str(e)}")
        return jsonify({"error": "Failed to change password"}), 500


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """
    Logout user (client should discard token).

    Requires valid JWT token in Authorization header.
    Returns success message.
    """
    # In a stateless JWT system, logout is handled client-side
    # by discarding the token. This endpoint provides confirmation.
    return jsonify({"message": "Logout successful"})

