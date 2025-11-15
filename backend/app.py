'''
Main Flask Application
Initializes the app, registers blueprints, and configures middleware.

This is the refactored version with organized routes.
'''

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Import configuration
from config import (
    SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS,
    SECRET_KEY, CORS_ORIGINS, RATE_LIMIT_ENABLED, RATE_LIMIT_DEFAULT,
    LOG_LEVEL, LOG_FILE
)

# Import models
from models import db

# Import utilities
from utils.logger import setup_logger

# Import middleware
from middlewares.security import configure_security_middleware

# Import route blueprints
from routes import (
    auth_bp,
    posts_bp,
    comments_bp,
    courses_bp,
    users_bp,
    groups_bp
)

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
# ROUTE REGISTRATION
# ============================================================================

# Base route
@app.route("/", methods=["GET"])
def home():
    """
    Base route for the API.
    
    Returns a welcome message to confirm the API is running.
    """
    return jsonify({"message": "Welcome to the Cloud Blog API"})

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(users_bp)
app.register_blueprint(groups_bp)

# Apply rate limiting to specific routes using full route paths
limiter.limit("5 per hour")(app.view_functions['auth.register'])
limiter.limit("10 per minute")(app.view_functions['auth.login'])
limiter.limit("3 per hour")(app.view_functions['auth.change_password'])

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors."""
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle rate limit exceeded errors."""
    logger.warning(f"Rate limit exceeded: {error}")
    return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error."""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# APPLICATION ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    logger.info("Starting Flask application...")
    app.run(debug=True, host="0.0.0.0", port=5000)
