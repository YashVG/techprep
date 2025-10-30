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

    def generate_token(self, expires_in: int = None):
        """
        Generate a JWT token for the user.
        
        Args:
            expires_in: Token expiration time in seconds (uses config default if None)
            
        Returns:
            JWT token string
        """
        from config import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES
        
        if expires_in is None:
            expires_in = JWT_ACCESS_TOKEN_EXPIRES
        
        payload = {
            'user_id': self.id,
            'username': self.username,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

    @staticmethod
    def verify_token(token: str):
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            User object if token is valid, None otherwise
        """
        from config import JWT_SECRET_KEY
        
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
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

# Association table for group members (many-to-many relationship)
group_members = db.Table('group_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

class Group(db.Model):
    """
    Represents a group that users can create and join.
    
    - Mapped to the 'groups' table in PostgreSQL.
    - Each group has a name, description, and creator.
    - Many-to-many relationship with users through group_members table.
    """
    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Creator of the group
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    creator = db.relationship("User", backref="created_groups", foreign_keys=[creator_id])
    
    # Many-to-many relationship with users
    members = db.relationship("User", secondary=group_members, backref="groups", lazy='dynamic')

    def __init__(self, name, creator_id, description=None):
        self.name = name
        self.creator_id = creator_id
        self.description = description

    def to_dict(self, include_members=False):
        """Convert group to dictionary."""
        result = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator_id': self.creator_id,
            'creator_username': self.creator.username if self.creator else None,
            'member_count': self.members.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_members:
            result['members'] = [
                {
                    'id': member.id,
                    'username': member.username
                }
                for member in self.members.all()
            ]
        
        return result

class Course(db.Model):
    """
    Represents a course that posts can be associated with.
    
    - Mapped to the 'courses' table in PostgreSQL.
    - Each course has a unique code and optional name.
    - No tracking of who created the course.
    """
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)  # e.g., "CPSC221"
    name = db.Column(db.String(100), nullable=True)  # e.g., "Data Structures and Algorithms"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Remove this line - it's causing the error:
    # posts = db.relationship("Post", backref="course_ref", lazy=True)

    def __init__(self, code, name=None):
        self.code = code.upper()  # Store course codes in uppercase
        self.name = name

    def to_dict(self):
        """Convert course to dictionary."""
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
