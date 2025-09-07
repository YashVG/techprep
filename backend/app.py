'''
- PURPOSE OF APP: To create users and posts on a containerized platform
'''


from flask import Flask, request, jsonify, g
from sqlalchemy.exc import IntegrityError
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db, Post, User, Comment, Course
from flask_cors import CORS
from flask_migrate import Migrate
from functools import wraps
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS

db.init_app(app)
migrate = Migrate(app, db)

# Authentication decorator
def login_required(f):
    """Decorator to require authentication for protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token required"}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        user = User.verify_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

# Password validation function
def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@app.route("/", methods=["GET"])
def home():
    """
    Base route for the API.

    Returns a welcome message to confirm the API is running.
    """
    return jsonify({"message": "Welcome to the Cloud Blog API"})

@app.route("/auth/register", methods=["POST"])
def register():
    """
    Register a new user with password validation.

    Accepts JSON with 'username', 'email', and 'password'.
    Returns user data and JWT token upon successful registration.
    """
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    # Validate password strength
    is_valid, message = validate_password(data['password'])
    if not is_valid:
        return jsonify({"error": message}), 400
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate username format (alphanumeric and underscores only)
    username_pattern = r'^[a-zA-Z0-9_]+$'
    if not re.match(username_pattern, data['username']):
        return jsonify({"error": "Username can only contain letters, numbers, and underscores"}), 400
    
    try:
        user = User(
            username=data["username"], 
            email=data["email"], 
            password=data["password"]
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = user.generate_token()
        
        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict(),
            "token": token
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username or email already exists"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500

@app.route("/auth/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT token.

    Accepts JSON with 'username' and 'password'.
    Returns user data and JWT token upon successful authentication.
    """
    data = request.get_json()
    
    if not all(key in data for key in ['username', 'password']):
        return jsonify({"error": "Username and password are required"}), 400
    
    user = User.query.filter_by(username=data["username"]).first()
    
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401
    
    if not user.is_active:
        return jsonify({"error": "Account is deactivated"}), 401
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate JWT token
    token = user.generate_token()
    
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "token": token
    })

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
    data = request.get_json()
    
    if 'email' in data:
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({"error": "Invalid email format"}), 400
        
        try:
            g.current_user.email = data['email']
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Email already exists"}), 400
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": g.current_user.to_dict()
    })

@app.route("/auth/change-password", methods=["POST"])
@login_required
def change_password():
    """
    Change current user's password.

    Requires valid JWT token in Authorization header.
    Accepts JSON with 'current_password' and 'new_password'.
    Returns success message.
    """
    data = request.get_json()
    
    if not all(key in data for key in ['current_password', 'new_password']):
        return jsonify({"error": "Current password and new password are required"}), 400
    
    # Verify current password
    if not g.current_user.check_password(data['current_password']):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Validate new password strength
    is_valid, message = validate_password(data['new_password'])
    if not is_valid:
        return jsonify({"error": message}), 400
    
    # Set new password
    g.current_user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"})

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
    data = request.get_json()
    
    if not all(key in data for key in ['title', 'content']):
        return jsonify({"error": "Title and content are required"}), 400
    
    post = Post(
        title=data["title"],
        content=data["content"],
        user_id=g.current_user.id,
        tags=data.get("tags", []),
        course=data.get("course"),
        code=data.get("code")
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": g.current_user.username,
        "tags": post.tags,
        "course": post.course,
        "code": post.code
    }), 201




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
    data = request.get_json()
    
    if not all(key in data for key in ['content', 'post_id']):
        return jsonify({"error": "Content and post_id are required"}), 400
    
    post = Post.query.get_or_404(data["post_id"])
    
    comment = Comment(
        content=data["content"],
        user_id=g.current_user.id,
        post_id=data["post_id"]
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({
        "message": "Comment added",
        "id": comment.id,
        "user": g.current_user.username,
        "post_id": comment.post_id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat() if comment.created_at else None
    }), 201


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
    data = request.get_json()
    
    if not data.get('code'):
        return jsonify({"error": "Course code is required"}), 400
    
    # Validate course code format (alphanumeric, 3-10 characters)
    code_pattern = r'^[A-Za-z0-9]{3,10}$'
    if not re.match(code_pattern, data['code']):
        return jsonify({"error": "Course code must be 3-10 alphanumeric characters"}), 400
    
    try:
        # Check if course already exists
        course = Course.query.filter_by(code=data['code'].upper()).first()
        
        if not course:
            # Create new course
            course = Course(
                code=data['code'],
                name=data.get('name')
            )
            db.session.add(course)
            db.session.commit()
        
        return jsonify({
            "message": "Course available",
            "course": course.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add course"}), 500

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
