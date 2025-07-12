from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

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

    def __init__(self, title, content, user_id, tags=None, course=None, code=None):
        self.title = title
        self.content = content
        self.user_id = user_id
        self.tags = tags or []
        self.course = course
        self.code = code

class User(db.Model):
    """
    Represents a registered user.

    - Mapped to the 'users' table in PostgreSQL.
    - Each user has a unique username and email.
    - One-to-many relationship: a user can author multiple posts.
    - Related to Post via 'posts' relationship and to Comment via 'comments'.
    """
    __tablename__ = "users"  # optional but clearer

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    posts = db.relationship("Post", backref="author", lazy=True)

    def __init__(self, username, email):
        self.username = username
        self.email = email


# Comment model
class Comment(db.Model):
    """
    Represents a comment made on a blog post.

    - Mapped to the 'comments' table in PostgreSQL.
    - Each comment is linked to one user and one post via foreign keys.
    - One-to-many relationships:
        - A user can have many comments.
        - A post can have many comments.
    """
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    user = db.relationship("User", backref="comments", lazy=True)
    post = db.relationship("Post", backref="comments", lazy=True)

    def __init__(self, content, user_id, post_id):
        self.content = content
        self.user_id = user_id
        self.post_id = post_id