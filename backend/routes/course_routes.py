"""
Course Routes
Handles course management (CRUD operations)
"""

from flask import Blueprint, request, jsonify, g

from models import db, Course
from decorators import login_required
from utils.validation import validate_course_code, validate_string_length
from utils.sanitization import sanitize_plain_text
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Create blueprint
courses_bp = Blueprint('courses', __name__, url_prefix='/courses')


@courses_bp.route("", methods=["GET"])
def get_courses():
    """
    Fetches all available courses.
    
    Returns a list of course dictionaries.
    """
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses])


@courses_bp.route("", methods=["POST"])
@login_required
def add_course():
    """
    Creates a new course if it doesn't exist.
    
    Requires authentication. Accepts JSON with 'code' and 'name' (both required).
    Returns the course data (existing or newly created).
    """
    try:
        data = request.get_json()
        
        if not data.get('code'):
            return jsonify({"error": "Course code is required"}), 400
        
        if not data.get('name'):
            return jsonify({"error": "Course name is required"}), 400
        
        # Sanitize and validate course code
        code = sanitize_plain_text(data['code'])
        is_valid, message = validate_course_code(code)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Sanitize and validate course name
        name = sanitize_plain_text(data['name'])
        is_valid, message = validate_string_length(name, min_length=1, max_length=100, field_name="Course name")
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Check if course already exists
        course = Course.query.filter_by(code=code.upper()).first()
        
        if not course:
            # Create new course
            course = Course(
                code=code.upper(),
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


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@login_required
def delete_course(course_id):
    """
    Deletes a course by ID.
    
    Requires authentication.
    Returns confirmation message.
    """
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    
    logger.info(f"Course {course_id} deleted by user {g.current_user.id}")
    
    return jsonify({"message": "Course deleted"})

