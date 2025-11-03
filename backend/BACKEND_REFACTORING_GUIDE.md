

# Backend Refactoring Guide

## Overview

The backend `app.py` file has been refactored into separate route modules using Flask Blueprints. This makes the codebase more maintainable, organized, and follows industry best practices.

## New Structure

```
backend/
├── app_refactored.py          # New streamlined main application file
├── decorators.py               # Common decorators (login_required)
├── routes/
│   ├── __init__.py            # Blueprint exports
│   ├── auth_routes.py         # Authentication routes (/auth/*)
│   ├── post_routes.py         # Post CRUD routes (/posts/*)
│   ├── comment_routes.py      # Comment routes (/comments/*)
│   ├── course_routes.py       # Course management (/courses/*)
│   ├── user_routes.py         # User routes (/users/*)
│   └── group_routes.py        # Group management (/groups/*)
├── models.py                   # (unchanged)
├── config.py                   # (unchanged)
├── utils/                      # (unchanged)
└── middlewares/                # (unchanged)
```

## Benefits

1. **Separation of Concerns**: Each route module handles a specific domain
2. **Maintainability**: Easier to find and update specific routes
3. **Scalability**: Easy to add new route modules
4. **Testing**: Each blueprint can be tested independently
5. **Team Collaboration**: Different team members can work on different modules
6. **Code Organization**: ~950 lines reduced to ~120 lines in main app + organized modules

## Migration Steps

### Step 1: Backup Current File

```bash
cd /Users/yash/Desktop/techprep/backend
cp app.py app_old.py
```

### Step 2: Use Refactored Version

```bash
mv app_refactored.py app.py
```

### Step 3: Test the Application

```bash
# Make sure docker is running the database
docker-compose up -d

# Test the application
python app.py
```

### Step 4: Verify All Routes Work

Test each endpoint:

```bash
# Base route
curl http://localhost:5001/

# Auth routes
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'

# Posts
curl http://localhost:5001/posts

# Courses
curl http://localhost:5001/courses

# Groups
curl http://localhost:5001/groups
```

## Route Organization

### Authentication Routes (`/auth/*`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)
- `PUT /auth/profile` - Update profile (protected)
- `POST /auth/change-password` - Change password (protected)
- `POST /auth/logout` - Logout (protected)

### Post Routes (`/posts/*`)
- `GET /posts` - Get all posts
- `POST /posts` - Create post (protected)
- `DELETE /posts/<id>` - Delete post (protected)
- `GET /posts/<id>/comments` - Get post comments

### Comment Routes (`/comments/*`)
- `POST /comments` - Create comment (protected)

### Course Routes (`/courses/*`)
- `GET /courses` - Get all courses
- `POST /courses` - Create course (protected)
- `DELETE /courses/<id>` - Delete course (protected)

### User Routes (`/users/*`)
- `GET /users` - Get all users
- `GET /users/<id>` - Get specific user
- `GET /users/<id>/posts` - Get user's posts
- `GET /users/<id>/groups` - Get user's groups

### Group Routes (`/groups/*`)
- `GET /groups` - Get all groups
- `POST /groups` - Create group (protected)
- `GET /groups/<id>` - Get group details
- `PUT /groups/<id>` - Update group (protected)
- `DELETE /groups/<id>` - Delete group (protected)
- `POST /groups/<id>/members` - Add member (protected)
- `DELETE /groups/<id>/members/<user_id>` - Remove member (protected)

## How Blueprints Work

### Before (Monolithic)
```python
@app.route("/auth/login", methods=["POST"])
def login():
    # login logic
    pass
```

### After (Blueprint)
```python
# In routes/auth_routes.py
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route("/login", methods=["POST"])
def login():
    # Same login logic
    pass

# In app.py
app.register_blueprint(auth_bp)
```

The URL remains the same: `/auth/login`

## Rate Limiting

Rate limiting is applied in the main `app.py` file after blueprint registration:

```python
limiter.limit("5 per hour")(auth_bp.view_functions['register'])
limiter.limit("10 per minute")(auth_bp.view_functions['login'])
limiter.limit("3 per hour")(auth_bp.view_functions['change_password'])
```

## Key Changes

### 1. Decorators Module
The `login_required` decorator has been extracted to `decorators.py` for reusability:

```python
from decorators import login_required

@some_bp.route("/protected")
@login_required
def protected_route():
    # Access current user via g.current_user
    pass
```

### 2. Blueprint Imports
All blueprints are imported in `routes/__init__.py`:

```python
from .auth_routes import auth_bp
from .post_routes import posts_bp
# etc.
```

### 3. Simplified Main App
The main `app.py` is now ~120 lines vs ~950 lines:
- Configuration
- Blueprint registration
- Rate limiting setup
- Error handlers

## Troubleshooting

### Import Errors
If you see import errors, make sure:
1. All route files are in the `routes/` directory
2. `routes/__init__.py` exists and exports all blueprints
3. `decorators.py` is in the backend root

### Route Not Found (404)
Check that:
1. The blueprint is registered in `app.py`
2. The route URL prefix matches expectations
3. The HTTP method is correct

### Rate Limiting Not Working
Verify:
1. `RATE_LIMIT_ENABLED` is set to `True` in config
2. The limiter is applied to the correct view function name
3. The rate limit decorators are in `app.py` after blueprint registration

## Rolling Back

If you need to revert to the original:

```bash
cd /Users/yash/Desktop/techprep/backend
mv app.py app_refactored.py
mv app_old.py app.py
```

## Future Enhancements

With this structure, you can easily:

1. **Add new route modules**: Create a new blueprint file and register it
2. **Add middleware per blueprint**: Apply middleware to specific blueprints only
3. **Version APIs**: Create v1/ and v2/ blueprint directories
4. **Add API documentation**: Generate docs per blueprint
5. **Implement testing**: Test each blueprint independently

## Example: Adding a New Route Module

```python
# routes/notification_routes.py
from flask import Blueprint, jsonify

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

@notifications_bp.route("", methods=["GET"])
def get_notifications():
    return jsonify({"notifications": []})

# routes/__init__.py
from .notification_routes import notifications_bp

# app.py
from routes import notifications_bp
app.register_blueprint(notifications_bp)
```

## Comparison

### Before
- **app.py**: 957 lines
- **Organization**: All routes in one file
- **Navigation**: Hard to find specific routes
- **Collaboration**: Merge conflicts common

### After
- **app.py**: ~120 lines
- **auth_routes.py**: ~270 lines
- **post_routes.py**: ~160 lines
- **comment_routes.py**: ~70 lines
- **course_routes.py**: ~110 lines
- **user_routes.py**: ~105 lines
- **group_routes.py**: ~300 lines
- **decorators.py**: ~40 lines
- **routes/__init__.py**: ~20 lines

**Total**: Similar lines of code, but organized and maintainable!

## Notes

- All functionality remains identical
- No database changes needed
- No frontend changes needed
- All security features preserved
- Rate limiting still works
- Logging still works
- All middleware still applies

---

**Ready for Production**: This refactored structure follows Flask best practices and is used in production applications worldwide.

