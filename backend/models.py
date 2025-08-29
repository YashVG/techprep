from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os

db = SQLAlchemy()

class Post(db.Model):
    """
    Represents a blog post entry.

    - Mapped to the 'posts' table in PostgreSQL.
    - Each post has a title, content, and an associated user (author).
    - Linked to the 'User' model via a foreign key (user_id).
    - Includes tags and an optional UBC course reference.
    """
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    tags = db.Column(db.ARRAY(db.String), nullable=True)  # List of general tags
    course = db.Column(db.String(20), nullable=True)       # UBC course code

    # New: code string for code editor integration
    code = db.Column(db.Text, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, title, content, user_id, tags=None, course=None, code=None):
        self.title = title
        self.content = content
        self.user_id = user_id
        self.tags = tags or []
        self.course = course
        self.code = code

class User(db.Model):
    """
    Represents a registered user with authentication capabilities.

    - Mapped to the 'users' table in PostgreSQL.
    - Each user has a unique username and email.
    - Includes secure password hashing and JWT token generation.
    - One-to-many relationship: a user can author multiple posts.
    - Related to Post via 'posts' relationship and to Comment via 'comments'.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    posts = db.relationship("Post", backref="author", lazy=True)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)

    def set_password(self, password):
        """Hash and set the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify the user's password."""
        return check_password_hash(self.password_hash, password)

    def generate_token(self):
        """Generate a JWT token for the user."""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'exp': datetime.utcnow() + timedelta(days=1)  # 24 hour expiry
        }
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        return jwt.encode(payload, secret_key, algorithm='HS256')

    @staticmethod
    def verify_token(token):
        """Verify and decode a JWT token."""
        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except jwt.ExpiredSignatureError:
            return None  # Token has expired
        except jwt.InvalidTokenError:
            return None  # Invalid token

    def to_dict(self):
        """Convert user to dictionary (excluding sensitive data)."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


# Comment model
class Comment(db.Model):
    """
    Represents a comment made on a blog post.

    - Mapped to the 'comments' table in PostgreSQL.
    - Each comment is linked to one user and one post via foreign keys.
    - One-to-many relationships:
        - A user can have many comments.
        - A user can have many comments.
    """
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    user = db.relationship("User", backref="comments", lazy=True)
    post = db.relationship("Post", backref="comments", lazy=True)

    def __init__(self, content, user_id, post_id):
        self.content = content
        self.user_id = user_id
        self.post_id = post_id