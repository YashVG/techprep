'''
- PURPOSE OF APP: To create users and posts on a containerized platform
'''


from flask import Flask, request, jsonify
from sqlalchemy.exc import IntegrityError
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db, Post, User, Comment
from flask_cors import CORS
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS

db.init_app(app)
migrate = Migrate(app, db)
 

@app.route("/", methods=["GET"])
def home():
    """
    Base route for the API.

    Returns a welcome message to confirm the API is running.
    """
    return jsonify({"message": "Welcome to the Cloud Blog API"})


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
def add_post():
    """
    Creates a new blog post.

    Accepts JSON with 'title', 'content', 'username', optional 'tags', 'course', and 'code'.
    Returns the ID of the created post.
    """
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    post = Post(
        title=data["title"],
        content=data["content"],
        user_id=user.id,
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
        "author": user.username,
        "tags": post.tags,
        "course": post.course,
        "code": post.code
    }), 201


@app.route("/users", methods=["POST"])
def add_user():
    """
    Creates a new user.

    Accepts JSON with 'username' and 'email'.
    Returns the ID of the created user or an error message if user exists.
    """
    data = request.get_json()
    user = User(username=data["username"], email=data["email"])
    db.session.add(user)
    try:
        db.session.commit()
        return jsonify({"message": "User created", "id": user.id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username or email already exists"}), 400

# test using Postman or curl, browser only supports GET + PUT
@app.route("/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    """
    Deletes a post by ID.

    Returns a confirmation message upon successful deletion.
    """
    post = Post.query.get_or_404(post_id)
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
def add_comment():
    """
    Adds a comment to a post using username.

    Accepts JSON with 'content', 'username', and 'post_id'.
    Resolves the username to user_id internally.
    """
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    comment = Comment(
        content=data["content"],
        user_id=user.id,
        post_id=data["post_id"]
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({
        "message": "Comment added",
        "id": comment.id,
        "user": user.username,
        "post_id": comment.post_id,
        "content": comment.content
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
