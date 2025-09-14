# Project Changelog - UBC Tech Prep Portfolio

## Overview

This is a full-stack web application built with React.js frontend and Flask backend, featuring a blog-style post system with comments, code editor integration, and user management.

## Tech Stack

- **Frontend**: React.js, Monaco Editor, React Router DOM
- **Backend**: Flask, SQLAlchemy, Flask-Migrate
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT tokens, Werkzeug password hashing

## Development History

### Initial Setup & Core Features

- Created React frontend with basic post display
- Set up Flask backend with SQLAlchemy ORM
- Implemented PostgreSQL database with Docker
- Created basic models: User, Post, Comment

### UI/UX Enhancements (Phase 1)

- **Post Layout Redesign**:
  - Reorganized posts with highlighted titles, content as subheadings
  - Added tags and comments below each post
  - Implemented consistent yellow/gold color theme with dark grey backgrounds
  - Added author display in top-right corner of posts

- **Button Styling**:
  - Unified button appearance with yellow theme
  - Consistent styling across all interactive elements

- **Modal System**:
  - Created pop-up sign-up form with modal overlay
  - Extracted SignUpModal into separate component for reusability
  - Styled modal to match app's color theme

### Code Editor Integration (Phase 2)

- **Monaco Editor Setup**:
  - Integrated Monaco Editor (VS Code's editor) for code display
  - Added language switching (JavaScript, Python, C++, Java)
  - Created TestingPage component for editor experimentation
  - Added code extraction and storage functionality

- **Database Schema Updates**:
  - Added `code` column to Post model (TEXT type)
  - Updated API endpoints to handle code data
  - Implemented Flask-Migrate for database migrations
  - Fixed schema mismatch issues with Docker database

- **Add Post Enhancement**:
  - Integrated Monaco Editor into AddPost component
  - Added code editor with language selection
  - Implemented form submission with code data

### Comments System Redesign (Phase 3)

- **Comments Sidebar**:
  - Moved comments from below posts to scrollable sidebar on the right
  - Implemented dynamic height matching with post cards
  - Added visible scrollbar styling
  - Prevented horizontal resizing when toggling comments

- **Layout Stability**:
  - Fixed post card width to 600px to prevent horizontal stretching
  - Used flexbox with `flex-shrink: 0` for stable layouts
  - Implemented `useRef` and `useEffect` for dynamic height calculations

- **Comment Form Integration**:
  - Moved "Add Comment" functionality into comments sidebar
  - Replaced comments view with form when adding new comments
  - Improved user experience with inline comment creation

### Comprehensive Authentication System (Phase 4)

- **Backend Authentication Infrastructure**:
  - **User Model Enhancement**: Added `password_hash`, `is_active`, `created_at`, `last_login` fields
  - **Password Security**: Implemented Werkzeug password hashing with salt
  - **JWT Token System**: Added PyJWT dependency for secure token-based authentication
  - **Token Management**: 24-hour expiry, automatic user verification
  - **Database Migration**: Created new migration for authentication fields and timestamps

- **Authentication Endpoints**:
  - **`POST /auth/register`**: User registration with comprehensive validation
  - **`POST /auth/login`**: User authentication with JWT token generation
  - **`GET /auth/profile`**: Protected user profile retrieval
  - **`PUT /auth/profile`**: Protected user profile updates
  - **`POST /auth/change-password`**: Secure password change functionality
  - **`POST /auth/logout`**: Logout confirmation (client-side token removal)

- **Security Features**:
  - **Password Requirements**: 8+ characters, uppercase, lowercase, number
  - **Input Validation**: Email format, username format (alphanumeric + underscores)
  - **Protected Routes**: Posts creation, deletion, and comments require authentication
  - **Owner-Only Actions**: Users can only delete their own posts
  - **JWT Decorator**: `@login_required` decorator for route protection

- **Frontend Authentication Components**:
  - **`AuthContext.js`**: React context for global authentication state management
  - **`AuthHeader.js`**: Navigation header with login/logout buttons and user info
  - **`LoginModal.js`**: User login interface with validation
  - **`SignUpModal.js`**: Enhanced registration with password confirmation
  - **Updated `Post.js`**: Authentication-aware post management

- **Frontend Authentication Features**:
  - **State Management**: Centralized auth state with localStorage persistence
  - **Protected UI Elements**: Add post/comment buttons only visible when authenticated
  - **User Experience**: Clear messaging for unauthenticated users
  - **Form Validation**: Client-side validation matching backend requirements
  - **Error Handling**: Comprehensive error display and user feedback

- **API Integration Updates**:
  - **Protected Endpoints**: All post/comment operations now require valid JWT tokens
  - **Authorization Headers**: Automatic token inclusion in authenticated requests
  - **Error Handling**: Proper error responses for unauthorized access
  - **User Context**: Current user information available throughout the app

### Dynamic Course Management System (Phase 5) - CURRENT

- **Database Schema Enhancement**:
  - **Course Model**: Added `Course` model with `id`, `code`, `name`, `created_at` fields
  - **Database Migration**: Created migration for courses table with proper relationships
  - **No Foreign Key Dependencies**: Courses stored as strings in posts for simplicity

- **Backend API Endpoints**:
  - **`GET /courses`**: Fetch all available courses (public)
  - **`POST /courses`**: Add new course (authenticated, creates if doesn't exist)
  - **`DELETE /courses/:id`**: Delete course (authenticated, creator only)
  - **`GET /users/:id/posts`**: Get all posts by specific user (public)

- **Frontend Course Management**:
  - **Dynamic Course Loading**: Courses fetched from API instead of hardcoded
  - **Add Course on-the-fly**: Users can add new courses when creating posts
  - **Course Selection UI**: Enhanced dropdown with course codes and names
  - **Real-time Updates**: New courses immediately appear in dropdown and get selected

- **User Posts Management**:
  - **"My Posts" Button**: Toggle between all posts and user's own posts
  - **User Posts API**: Integrated with `/users/:id/posts` endpoint
  - **Dynamic Post Filtering**: Seamless switching between all posts and user posts
  - **Post Count Display**: Shows number of user's posts

- **Courses Display System**:
  - **"Courses" Button**: Opens popup modal to view all available courses
  - **Modal Interface**: Consistent with Add Post modal design
  - **Grid Layout**: Responsive course cards with hover effects
  - **Course Information**: Displays course code, name, and creation date
  - **Empty State**: Helpful message when no courses exist

- **UI/UX Improvements**:
  - **Modal Consistency**: All popups use same styling and behavior
  - **Responsive Design**: Course grid adapts to different screen sizes
  - **Hover Effects**: Subtle animations on course cards
  - **Clean Code**: Removed unnecessary comments and improved formatting

### Component Architecture

- **Modular Components**:
  - `Post.js`: Individual post display with comments sidebar and authentication
  - `SignUpModal.js`: Enhanced registration with password validation
  - `LoginModal.js`: User authentication interface
  - `AuthHeader.js`: Navigation with authentication controls
  - `AuthContext.js`: Authentication state management
  - `AddPost.js`: Post creation with code editor and dynamic course selection (protected)
  - `TestingPage.js`: Development/testing page (deleted)

### Database Management

- **Migration System**:
  - Implemented Flask-Migrate for schema changes
  - Created migrations for code column addition
  - **NEW**: Added authentication fields migration
  - **NEW**: Added courses table migration
  - Handled Docker vs local database differences
  - Fixed schema mismatch errors
  - **NEW**: Clean migration system after corrupted migration cleanup

- **Schema Evolution**:

  ```sql
  -- Before Authentication
  users: id, username, email
  
  -- After Authentication Implementation
  users: id, username, email, password_hash, is_active, created_at, last_login
  posts: id, title, content, code, user_id, tags, course, created_at, updated_at
  comments: id, content, user_id, post_id, created_at
  
  -- After Course Management Implementation
  courses: id, code, name, created_at
  ```

### Error Handling & Fixes

- **Dependency Issues**:
  - Fixed missing `react-router-dom` dependency
  - Resolved `psycopg2` module not found errors
  - Added `flask-migrate` to requirements
  - **NEW**: Added `PyJWT==2.8.0` for JWT authentication

- **Layout Issues**:
  - Fixed horizontal resizing when toggling comments
  - Resolved Monaco Editor ResizeObserver warnings
  - Fixed "Cannot access 'showComments' before initialization" error

- **Database Issues**:
  - Resolved `UndefinedColumn` errors for code column
  - Fixed duplicate table creation in Docker migrations
  - **NEW**: Fixed corrupted migration causing `relation "post" does not exist` error
  - **NEW**: Cleaned up migration history and recreated proper schema
  - **NEW**: Resolved `password_hash` NOT NULL constraint violations
  - **NEW**: Fixed Course model relationship issues

- **Authentication Issues**:
  - **NEW**: Fixed JWT token verification and user context
  - **NEW**: Resolved protected route access control
  - **NEW**: Fixed password validation and hashing

### Security & Configuration

- **Git Configuration**:
  - Updated `.gitignore` with comprehensive exclusions
  - Added Python, Node.js, Docker, and system file ignores
  - Protected sensitive dependencies and environment files

- **Authentication Security**:
  - **NEW**: JWT token-based authentication with expiration
  - **NEW**: Secure password hashing with Werkzeug
  - **NEW**: Input validation and sanitization
  - **NEW**: Protected route decorators
  - **NEW**: Owner-only resource access control

## Current State

- **Working Features**:
  - **NEW**: Complete user authentication system (register, login, logout)
  - **NEW**: JWT token-based session management
  - **NEW**: Protected post creation and comment system
  - **NEW**: User profile management
  - **NEW**: Dynamic course management system
  - **NEW**: User posts filtering ("My Posts" functionality)
  - **NEW**: Courses display popup modal
  - **NEW**: On-the-fly course creation during post creation
  - Post creation with code editor integration (now protected)
  - Comments system with scrollable sidebar (now protected)
  - Responsive layout with stable post widths
  - Monaco Editor with language switching

- **Database Schema**:

  ```sql
  users: id, username, email, password_hash, is_active, created_at, last_login
  posts: id, title, content, code, user_id, tags, course, created_at, updated_at
  comments: id, content, user_id, post_id, created_at
  courses: id, code, name, created_at
  ```

- **API Endpoints**:
  - **Authentication**:
    - POST /auth/register - User registration
    - POST /auth/login - User authentication
    - GET /auth/profile - Get user profile (protected)
    - PUT /auth/profile - Update user profile (protected)
    - POST /auth/change-password - Change password (protected)
    - POST /auth/logout - Logout (protected)
  - **Content**:
    - GET /posts - View all posts (public)
    - POST /posts - Create post (protected)
    - DELETE /posts/:id - Delete post (protected, owner only)
    - POST /comments - Add comment (protected)
    - GET /posts/:id/comments - View post comments (public)
    - GET /users/:id/posts - Get user's posts (public)
  - **Courses**:
    - GET /courses - View all courses (public)
    - POST /courses - Add new course (protected)
    - DELETE /courses/:id - Delete course (protected, creator only)

## Known Issues & Technical Debt

- ~~No user authentication (intentionally simplified)~~ ✅ **RESOLVED**
- ~~No password protection for user accounts~~ ✅ **RESOLVED**
- ~~Limited user profile functionality~~ ✅ **RESOLVED**
- ~~No dynamic course management~~ ✅ **RESOLVED**
- No search or filtering capabilities
- No post categories or tags management
- No password reset functionality
- No email verification system

## Future Enhancement Opportunities

- ~~User authentication with proper security~~ ✅ **IMPLEMENTED**
- ~~User profiles and avatars~~ ✅ **PARTIALLY IMPLEMENTED**
- ~~Dynamic course management~~ ✅ **IMPLEMENTED**
- Password reset and email verification
- Post search and filtering
- Post categories and tags
- Rich text editing for post content
- File upload capabilities
- Real-time notifications
- User roles and permissions
- OAuth integration (Google, GitHub)
- Two-factor authentication

## Development Notes

- Use `npm start` in frontend/ to run React dev server
- Use `docker compose up` for backend and database
- Database migrations: `flask db migrate` and `flask db upgrade`
- **NEW**: Authentication requires valid JWT tokens in Authorization headers
- **NEW**: Protected routes automatically redirect unauthenticated users
- **NEW**: User registration includes password strength validation
- **NEW**: Courses are managed dynamically through API endpoints

## Authentication System Usage

### Backend

- JWT tokens expire after 24 hours
- Password requirements: 8+ chars, uppercase, lowercase, number
- All protected routes require `Authorization: Bearer <token>` header
- User sessions persist across browser restarts via localStorage

### Frontend

- Login/Register modals accessible from header
- Authentication state managed globally via React Context
- Protected UI elements only visible to authenticated users
- Automatic token inclusion in API requests

## Course Management System Usage

### Backend

- Courses are stored in separate `courses` table
- Course codes are automatically converted to uppercase
- Duplicate course codes are prevented
- Course deletion requires authentication and ownership

### Frontend

- Courses are fetched dynamically from API
- Users can add new courses when creating posts
- Course selection shows both code and name
- Courses display in popup modal with grid layout

## Last Updated

- Date: September 6, 2025
- Status: **MAJOR UPDATE** - Dynamic course management and user posts system implemented
- Next Priority: Search functionality, post filtering, or advanced features
- Authentication Status: **PRODUCTION READY** ✅
- Course Management Status: **PRODUCTION READY** ✅

## Repository Structure Changes

- **Frontend Integration**: Moved frontend folder from separate GitHub repository to main repository
- **Monorepo Structure**: Now using single repository for full-stack application
- **Git Submodule Removal**: Eliminated submodule complexity for simpler development workflow
- **Unified Version Control**: All frontend and backend changes now tracked in single repository
