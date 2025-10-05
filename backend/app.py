'''
- PURPOSE OF APP: To create users and posts on a containerized platform

This is the main Flask application file. It initializes the app,
configures security middleware, sets up rate limiting, and defines API routes.

Security features:
- JWT authentication
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Security headers
- CORS configuration
- Comprehensive error handling and logging
'''

from flask import Flask, request, jsonify, g
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
from datetime import datetime

# Import configuration
from config import (
    SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS,
    SECRET_KEY, CORS_ORIGINS, RATE_LIMIT_ENABLED, RATE_LIMIT_DEFAULT,
    LOG_LEVEL, LOG_FILE
)

# Import models
from models import db, Post, User, Comment, Course

# Import utilities
from utils.validation import (
    validate_password, validate_email, validate_username, 
    validate_course_code, validate_string_length
)
from utils.sanitization import sanitize_html, sanitize_plain_text, sanitize_code
from utils.logger import setup_logger, log_security_event, log_api_call

# Import middleware
from middlewares.security import configure_security_middleware

# Initialize Flask app
app = Flask(__name__)

# Configure Flask
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config["SECRET_KEY"] = SECRET_KEY

# Configure CORS with specific origins
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

# Initialize database and migrations
db.init_app(app)
migrate = Migrate(app, db)

# Set up logging
logger = setup_logger(__name__, log_file=LOG_FILE, level=LOG_LEVEL)

# Configure security middleware
configure_security_middleware(app)

# Set up rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[RATE_LIMIT_DEFAULT] if RATE_LIMIT_ENABLED else [],
    storage_uri="memory://"
)

# ============================================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================================

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
        
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle rate limit exceeded errors."""
    log_security_event(logger, 'rate_limit_exceeded', details=str(error))
    return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429


# ============================================================================
# API ROUTES
# ============================================================================

@app.route("/", methods=["GET"])
def home():
    """
    Base route for the API.

    Returns a welcome message to confirm the API is running.
    """
    return jsonify({"message": "Welcome to the Cloud Blog API"})

@app.route("/auth/register", methods=["POST"])
@limiter.limit("5 per hour")  # Rate limit registration attempts
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

@app.route("/auth/login", methods=["POST"])
@limiter.limit("10 per minute")  # Rate limit login attempts
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

@app.route("/auth/profile", methods=["GET"])
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

@app.route("/auth/profile", methods=["PUT"])
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

@app.route("/auth/change-password", methods=["POST"])
@login_required
@limiter.limit("3 per hour")  # Rate limit password changes
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

@app.route("/auth/logout", methods=["POST"])
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


@app.route("/posts", methods=["GET"])
def get_posts():
    """
    Fetches all blog posts.

    Returns a list of post dictionaries with id, title, content, author username, tags, course, and code.
    """
    posts = Post.query.all()
    return jsonify([{
        "id": p.id,
        "title": p.title,
        "content": p.content,
        "author": p.author.username,
        "tags": p.tags,
        "course": p.course,
        "code": p.code
    } for p in posts])

@app.route("/posts", methods=["POST"])
@login_required
def add_post():
    """
    Creates a new blog post.

    Requires authentication. Accepts JSON with 'title', 'content', optional 'tags', 'course', and 'code'.
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
        
        post = Post(
            title=title,
            content=content,
            user_id=g.current_user.id,
            tags=tags,
            course=course,
            code=code
        )
        db.session.add(post)
        db.session.commit()
        
        logger.info(f"Post created by user {g.current_user.id}: Post ID {post.id}")
        
        return jsonify({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author": g.current_user.username,
            "tags": post.tags,
            "course": post.course,
            "code": post.code
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Post creation error: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500




# test using Postman or curl, browser only supports GET + PUT
@app.route("/posts/<int:post_id>", methods=["DELETE"])
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
        return jsonify({"error": "You can only delete your own posts"}), 403
    
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"})

@app.route("/users", methods=["GET"])
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

# Route to get a specific user and their posts
@app.route("/users/<int:user_id>", methods=["GET"])
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

@app.route("/comments", methods=["POST"])
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


# Route to get comments for a specific post
@app.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments_for_post(post_id):
    """
    Fetches all comments for a specific post.

    Returns a list of comment dictionaries including user info.
    """
    post = Post.query.get_or_404(post_id)
    comments = post.comments
    return jsonify([
        {
            "id": c.id,
            "content": c.content,
            "user": c.user.username,
            "post_id": c.post_id
        } for c in comments
    ])

@app.route("/courses", methods=["GET"])
def get_courses():
    """
    Fetches all available courses.
    
    Returns a list of course dictionaries.
    """
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses])

@app.route("/courses", methods=["POST"])
@login_required
def add_course():
    """
    Creates a new course if it doesn't exist.
    
    Requires authentication. Accepts JSON with 'code' and optional 'name'.
    Returns the course data (existing or newly created).
    """
    try:
        data = request.get_json()
        
        if not data.get('code'):
            return jsonify({"error": "Course code is required"}), 400
        
        # Sanitize and validate course code
        code = sanitize_plain_text(data['code'])
        is_valid, message = validate_course_code(code)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Sanitize course name
        name = None
        if data.get('name'):
            name = sanitize_plain_text(data['name'])
            is_valid, message = validate_string_length(name, min_length=1, max_length=100, field_name="Course name")
            if not is_valid:
                return jsonify({"error": message}), 400
        
        # Check if course already exists
        course = Course.query.filter_by(code=code.upper()).first()
        
        if not course:
            # Create new course
            course = Course(
                code=code,
                name=name
            )
            db.session.add(course)
            db.session.commit()
            logger.info(f"Course created: {course.code} by user {g.current_user.id}")
        
        return jsonify({
            "message": "Course available",
            "course": course.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Course creation error: {str(e)}")
        return jsonify({"error": "Failed to add course"}), 500

# @app.route("/coursesShowAll", methods=["GET"])
# def show_all_courses():
#     """
#     Shows all courses.
#     """
#     courses = Course.query.all()
#     return jsonify([course.to_dict() for course in courses])

@app.route("/courses/<int:course_id>", methods=["DELETE"])
@login_required
def delete_course(course_id):
    """
    Deletes a course by ID.
    """
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})

# Route to get all posts for a specific user, using username instead of user_id``
@app.route("/users/<int:user_id>/posts", methods=["GET"])
def get_user_posts(user_id):
    """
    Fetches all posts for a specific user.
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
