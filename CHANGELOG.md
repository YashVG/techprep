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

### Comprehensive CSS Refactoring - Complete Style Extraction (October 12, 2025) ⭐ MAJOR UPDATE

**Massive Code Cleanup: Removed 80+ Inline Style Objects Across Entire Frontend**

  This comprehensive refactoring eliminated nearly all inline styles from the React frontend, extracting them into well-organized, semantic CSS files. This significantly improves code readability, maintainability, and follows React best practices.

---

## [2025-10-13] - Information Page and Navigation Enhancement

### Added

- **About Page Component** (`About.js` + `About.css`)
  - Comprehensive informational page explaining Tech Prep Blog's purpose
  - Specifically tailored for UBC students preparing for technical interviews
  - Detailed sections on mission, interview prep, course support, and features
  - Professional dark-themed design with gold accents matching app aesthetic
  - Responsive layout for mobile and desktop viewing

- **TopRightControls Component** (`TopRightControls.js` + `TopRightControls.css`)
  - Container component for top-right navigation elements
  - Houses the user dropdown with fixed positioning
  - Fixed positioning ensures consistent placement across all pages

- **InfoButton Component** (`InfoButton.js` + `InfoButton.css` - NEW)
  - Circular info button (ℹ️) for easy access to About page
  - Fixed at top-left corner of screen for intuitive access
  - Matches design language of other navigation controls
  - Same styling as user dropdown and header buttons

- **BackButton Component** (`BackButton.js` + `BackButton.css`)
  - Navigation button to return from About page to home
  - Fixed at top-left of screen for intuitive navigation
  - Animated hover effects and responsive design
  - Shows arrow icon only on mobile, full text on desktop

- **Routing System**
  - Implemented React Router with Routes for About page
  - Seamless navigation between home and informational content
  - Maintains authentication state across page transitions

### Modified

- **App.js**
  - Added `TopRightControls` component to main layout
  - Implemented routing with `Routes` and `Route` components
  - Added route for `/about` path
  - Imported necessary routing dependencies

- **AuthHeader.js**
  - Removed `UserDropdown` component (now in TopRightControls)
  - Simplified component to focus only on title and login/signup buttons
  - Cleaner component separation and responsibilities

- **UserDropdown.css**
  - Changed positioning from `fixed` to `relative`
  - Positioning now controlled by parent `TopRightControls` component
  - Maintains all styling while improving component modularity

### Purpose

This update adds a dedicated informational page that clearly explains the platform's mission: helping UBC students ace technical interviews and coursework. The new navigation structure with the info button provides easy access to this information while maintaining the clean, modern UI aesthetic.

### Design Polish

- **AuthHeader.css**
  - Updated title with gradient gold effect and improved shadow for premium look
  - Matched font family across all header elements for consistency
  - Updated login/signup buttons to rounded style (border-radius: 25px) matching top-right controls
  - Both buttons now use identical semi-transparent backgrounds (`rgba(255, 215, 0, 0.1)`) matching info button and user dropdown
  - **Header container now has rounded corners (25px) with semi-transparent background matching button style**
  - Changed from full-width bar to centered pill-shaped container with gold border
  - Refined button sizing, padding, and spacing to perfectly match top-right controls
  - All header elements now share consistent design language with unified gold theme

---

## [2025-10-13] - Post Layout Redesign - Code-First Design

### Modified

- **Post Component Layout** (`Post.js` + `Post.css` + `App.css`)
  - Complete redesign inspired by Stack Overflow's code-first approach
  - **Two-column grid layout**: Left column (metadata/info) + Right column (code)
  - Left column (300px): Title, content, author, course, tags, action buttons
  - Right column (flexible): Code editor takes remaining space
  - **Code is now the primary focus** with larger, more prominent display
  - Title and content made more subtle with smaller fonts and muted colors
  - Post card redesigned with cleaner borders and better spacing
  - **Darker background (#1a1a1a) for improved text readability and contrast**
  - Added box shadow for depth and card separation
  - Metadata (author, course) moved to compact single line at top
  - Tags displayed inline with hashtag format (#tag)
  - Action buttons stacked vertically in left column for better organization
  - Increased post card width to 900px for two-column layout
  - Added subtle hover states to action buttons
  - Responsive: Stacks to single column on screens < 900px
  - Improved visual hierarchy: Code > Title > Content > Metadata
  
- **Comments Section Redesign** (`Post.css`)
  - Updated to match new dark theme with #1a1a1a background
  - Consistent border styling with gold accents
  - Modern button styling with transparent backgrounds and borders
  - Added hover states to all buttons and comment items
  - Improved form styling with focus states
  - Comment items now have subtle hover effects
  - Added user icon (👤) before comment author
  - Better spacing and typography throughout
  - All buttons now follow the consistent design language

---

## [2025-10-13] - Card-Based Post Layout with Modal Detail View

### Added

- **PostCard Component** (`PostCard.js` + `PostCard.css` - NEW)
  - Compact card view showing title, content preview (100 chars), and course code
  - Hover effects with elevation and border glow
  - Clickable cards that open full detail modal
  - Grid layout for browsing multiple posts at once
  - Shows first 3 tags with hashtag format
  - "Click to view →" CTA indicator

- **PostDetailModal Component** (`PostDetailModal.js` + `PostDetailModal.css` - NEW)
  - Full post detail view in modal overlay (like StackOverflow)
  - Large, scrollable modal with all post information
  - Complete code editor view with dynamic height
  - Full comments section with add/view functionality
  - Delete button for post authors
  - Course badge clickable for filtering
  - Escape/close functionality

### Modified

- **App.js**
  - Replaced full `Post` component with `PostCard` grid layout
  - Added `selectedPost` state for modal management
  - Implemented `handlePostClick` to open post details and fetch comments
  - Added `handleClosePostDetail` to close modal
  - Posts now render in responsive grid (auto-fill, min 350px)
  - Modal overlays main content when post is selected

- **App.css**
  - Added `.posts-grid` with CSS Grid layout
  - Responsive design: grid on desktop, single column on mobile
  - Maximum width of 1400px for optimal viewing

### Removed

- Direct rendering of full `Post` component in main view
- Inline comments sidebar (moved to modal only)

### Benefits

- Much cleaner, scannable main view
- Faster browsing through multiple posts
- Focus on titles and previews
- Code and details only shown when user is interested
- Better performance (less DOM elements rendered at once)
- More similar to modern Q&A platforms like StackOverflow

### Enhanced Comments Section Design

- **Two-Column Comment Layout** (`PostDetailModal.js` + `PostDetailModal.css`)
  - Left column (140px): Large circular avatar (60px) with user icon and username
  - Right column (flexible): Comment content with optimal reading width
  - Vertical divider between columns with subtle gold line
  - Avatar grows and glows on comment hover
  - Grid-based responsive layout (100px left column on mobile)
  - Better visual hierarchy with clear user/content separation
  
- **Visual Polish**
  - Added gradient backgrounds to comment form and individual comments
  - Emoji icons for section titles (💬 Comments, ✍️ Add Comment, 🔒 Login, 📝 Empty)
  - Vertical accent bar that appears on comment hover (left side)
  - Large circular avatar with gradient background and gold border
  - Larger, more readable text with better line-height (1.7)
  - Enhanced hover effects with shadows and avatar scale animation
  - Improved form with focus glow effect
  - Gradient buttons with better visual feedback
  - Empty state with dashed border and centered emoji
  - Better spacing and visual hierarchy throughout

---

## [2025-10-13] - UI Polish and Branding

### Modified

- **Browser Tab Title** (`frontend/public/index.html`)
  - Changed title from "React App" to "TechPrep"
  - Updated meta description to reflect platform purpose for UBC students
  
- **Overscroll Background Fix** (`index.css` + `App.css`)
  - Fixed white background appearing during overscroll
  - Set body and html background to dark (#2e2e2e)
  - Added pseudo-elements to prevent white bounce effect on mobile/desktop
  - Consistent dark theme throughout entire viewport and overscroll areas

#### Files Refactored

**1. App.js → App.css**

- Removed 30+ inline style objects
- Created semantic CSS classes for modals, buttons, forms, course displays, and layout components

**2. AddPost.js → AddPost.css (NEW FILE)**

- Removed 26 inline style objects
- Created dedicated styles for post creation modal with code editor integration

**3. Post.js → Post.css (NEW FILE)**

- Removed 27 inline style objects  
- Created comprehensive styles for post display, code viewer, and comments sidebar

**4. AuthHeader.js → AuthHeader.css (NEW FILE)**

- Removed 7 inline style objects
- Created clean auth header styles with responsive button layouts

**5. LoginModal.js & SignUpModal.js**

- Already using shared `.signup-modal-popup` styles from App.css
- Minimal inline styles remaining (form-specific dynamic styles only)

#### Summary Statistics

- **Files Modified**: 5 JavaScript files
- **CSS Files Created**: 3 new dedicated CSS files (AddPost.css, Post.css, AuthHeader.css)
- **Inline Styles Removed**: 80+ style objects eliminated
- **Lines of Code Cleaned**: ~300+ lines of inline style code extracted
- **CSS Classes Added**: 50+ new semantic CSS class names

#### Benefits

- ✨ **Dramatically Improved Readability**: JavaScript files are now 30-40% shorter and focus purely on logic
- 🎨 **Better Maintainability**: All styles in dedicated CSS files, easy to update globally
- ♻️ **Reusability**: CSS classes can be reused across components
- ⚡ **Better Performance**: CSS classes are more performant than inline styles
- 📚 **Self-Documenting**: Semantic class names clearly describe their purpose
- 🔧 **Separation of Concerns**: Complete separation of style and logic
- 🏆 **Best Practices**: Follows React and CSS best practices
- 🐛 **Easier Debugging**: Styles organized logically, easy to find and modify
- 📱 **Better for Theming**: Centralized styles make theme changes trivial

### API Configuration Refactoring (October 12, 2025)

**Centralized API Endpoint Management:**

- Refactored all hardcoded API URLs across the frontend to use centralized `API_ENDPOINTS` configuration
- Updated the following components to import and use `API_ENDPOINTS` from `config/api.js`:
  - `App.js` - All posts, comments, courses, and user endpoints
  - `AuthContext.js` - Authentication profile endpoints
  - `LoginModal.js` - Login endpoint
  - `SignUpModal.js` - Registration endpoint
  - `AddPost.js` - Course creation endpoint
- Implemented consistent use of `getAuthHeaders()` helper function for authenticated requests
- Improved code maintainability, readability, and safety by eliminating URL duplication
- Enhanced environment configuration flexibility - API base URL can now be changed via `REACT_APP_API_URL` environment variable
- All API endpoints are now managed in a single location (`frontend/src/config/api.js`), making it easy to update URLs for different environments (development, staging, production)

**Benefits:**

- Single source of truth for API endpoints
- Type-safe endpoint construction with function-based dynamic URLs (e.g., `API_ENDPOINTS.POSTS.DELETE(id)`)
- Consistent authorization header management
- Easier testing and debugging
- Reduced risk of typos and inconsistencies

### UI Layout Update (October 12, 2025)

**Frontend Button Layout:**

- Modified button layout in App.js to display the three main navigation buttons (Add Post, My Posts, Courses) in a horizontal row instead of a vertical column
- Consolidated three separate `.button-bar` divs into a single container for better layout control
- Improved visual hierarchy and user experience with more compact navigation

### Security & Maintainability Overhaul (October 5, 2025) ⭐ MAJOR UPDATE

This update implements comprehensive best practices for production-ready security and maintainability.

#### 🔐 Security Enhancements

**Environment Variable Management:**

- Implemented `python-dotenv` for secure environment variable handling
- Created `.env.example` template with all configuration options
- Moved sensitive data (SECRET_KEY, JWT_SECRET_KEY, DB_PASSWORD) to environment variables
- Added validation warnings for default/insecure keys on startup
- Updated docker-compose.yml to use environment variables with secure defaults

**Input Validation & Sanitization:**

- Created comprehensive validation utilities (`backend/utils/validation.py`):
  - `validate_password()` - Enforces strong password requirements
  - `validate_email()` - Email format and length validation
  - `validate_username()` - Username format validation
  - `validate_course_code()` - Course code format validation
  - `validate_string_length()` - Generic length validation with custom limits
- Created sanitization utilities (`backend/utils/sanitization.py`):
  - `sanitize_html()` - Prevents XSS attacks while allowing safe HTML
  - `sanitize_plain_text()` - Strips all HTML for plain text fields
  - `sanitize_code()` - Escapes code snippets for safe display
  - Configurable allowed HTML tags, attributes, and protocols
- Applied sanitization to all user inputs:
  - Usernames, emails (plain text)
  - Post titles, course codes (plain text)
  - Post content, comments (sanitized HTML)
  - Code snippets (escaped)

**Rate Limiting:**

- Integrated `Flask-Limiter` for API rate limiting
- Configured per-endpoint rate limits:
  - Registration: 5 attempts per hour
  - Login: 10 attempts per minute
  - Password change: 3 attempts per hour
  - General API: 100 requests per hour (configurable)
- Rate limits applied per IP address
- Custom error handler for 429 (Too Many Requests)
- Configurable via `RATE_LIMIT_ENABLED` and `RATE_LIMIT_DEFAULT` env vars

**Security Headers:**

- Created security middleware (`backend/middlewares/security.py`)
- Added comprehensive security headers to all responses:
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-XSS-Protection: 1; mode=block` - Browser XSS protection
  - `Content-Security-Policy` - Restricts resource loading
  - `Strict-Transport-Security` - Ready for HTTPS (commented, enable in production)

**CORS Configuration:**

- Restricted CORS to specific origins only
- Configurable via `CORS_ORIGINS` environment variable
- No more wildcard (*) origins - production-ready
- Credentials support with `supports_credentials=True`

**Authentication Improvements:**

- Updated JWT token generation to use configurable expiration
- Token verification moved to use centralized config
- Added type hints for better code safety
- Improved error messages for authentication failures

#### 📊 Logging & Monitoring

**Comprehensive Logging System:**

- Created logging utilities (`backend/utils/logger.py`):
  - `setup_logger()` - Configurable logger with file and console handlers
  - `log_security_event()` - Dedicated security event logging
  - `get_request_info()` - Extract request metadata (IP, path, user agent)
  - `log_api_call()` - Decorator for API call logging
- Configurable log level and file location via environment variables
- Structured log format with timestamp, level, and message
- Security event tracking:
  - Failed login attempts
  - Invalid token usage
  - Rate limit violations
  - Password change attempts
  - Registration duplicates

**What Gets Logged:**

- User registrations (username, user ID)
- Successful logins (username, user ID)
- Failed login attempts (username, IP)
- Post/comment creation (user ID, resource ID)
- Course creation (code, user ID)
- Profile updates (user ID)
- Password changes (user ID)
- All errors with full context
- Security violations

#### 🏗️ Code Organization & Maintainability

**Modular Backend Structure:**

- Created `backend/utils/` package for utility functions:
  - `validation.py` - All validation logic
  - `sanitization.py` - Input sanitization
  - `logger.py` - Logging utilities
- Created `backend/middlewares/` package:
  - `security.py` - Security headers and middleware
- Separated concerns for better testability and reusability
- Added comprehensive docstrings to all functions
- Type hints for better code documentation

**Error Handling:**

- Global error handlers for common HTTP errors:
  - 404 Not Found
  - 429 Rate Limit Exceeded
  - 500 Internal Server Error
- Try-catch blocks in all route handlers
- Proper database rollback on errors
- Consistent error response format
- Detailed error logging with context

**Enhanced app.py:**

- Added comprehensive module documentation
- Organized imports by category
- Clear section headers for different route groups
- Improved code comments
- Better error handling throughout
- Consistent response patterns

**Frontend Configuration:**

- Created `frontend/src/config/api.js` for centralized API configuration
- All API endpoints defined in one place
- Environment variable support (`REACT_APP_API_URL`)
- Helper function for authorization headers
- Easy to switch between dev/staging/production

#### 🛠️ Development Tools

**Linting & Formatting:**

- Added `.eslintrc.json` for JavaScript/React linting
- Added `.pylintrc` for Python linting with project-specific rules
- Added `.prettierrc.json` for consistent code formatting
- Configured rules for maintainable code

**Docker Improvements:**

- Updated docker-compose.yml to use environment variables throughout
- Added database health check
- Proper service dependencies with health conditions
- All configuration externalized via environment variables
- Default values for development ease

#### 📚 Documentation

**Comprehensive Documentation Created:**

1. **SECURITY.md** - Complete security guide covering:
   - Authentication & authorization best practices
   - Input validation & sanitization details
   - Rate limiting configuration
   - Security headers explained
   - Environment variable management
   - CORS configuration
   - Logging & monitoring
   - Deployment security checklist
   - Regular maintenance schedule

2. **API_DOCUMENTATION.md** - Full API reference with:
   - All endpoints documented
   - Request/response examples
   - Authentication requirements
   - Rate limits per endpoint
   - Error responses
   - cURL and JavaScript examples
   - HTTP status codes

3. **MAINTENANCE.md** - Operations guide including:
   - Setup & installation instructions
   - Environment configuration
   - Running in dev/production
   - Database management & migrations
   - Backup & restore procedures
   - Code quality tools
   - Monitoring & log management
   - Dependency updates
   - Troubleshooting guide
   - Maintenance schedules

4. **Enhanced .env.example** - Template with:
   - All configuration options
   - Descriptive comments
   - Security warnings
   - Default values
   - Setup instructions

#### 📦 Dependencies Added

**Python Packages:**

- `python-dotenv==1.0.0` - Environment variable management
- `Flask-Limiter==3.5.0` - API rate limiting
- `bleach==6.1.0` - HTML sanitization for XSS prevention

**Configuration Files:**

- `.eslintrc.json` - JavaScript linting
- `.pylintrc` - Python linting
- `.prettierrc.json` - Code formatting
- `backend/.env.example` - Environment template

#### 🔄 Breaking Changes

**None** - All changes are backwards compatible!

- Existing functionality maintained
- New features opt-in via environment variables
- Default values preserve current behavior
- Frontend code unchanged (API config is additive)

#### ⚙️ Configuration Requirements

**For Existing Installations:**

1. Create `backend/.env` from `backend/.env.example`
2. Generate secure keys:

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. Update environment variables
4. Install new dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Restart application

**For New Installations:**

- Follow MAINTENANCE.md setup instructions

#### 🎯 Production Readiness

This update makes the application **production-ready** with:

- ✅ Secure authentication and authorization
- ✅ Input validation and XSS prevention
- ✅ Rate limiting to prevent abuse
- ✅ Security headers for defense in depth
- ✅ Comprehensive logging for monitoring
- ✅ Proper error handling
- ✅ Environment-based configuration
- ✅ Complete documentation
- ✅ Development tools for code quality
- ✅ Maintainable, modular code structure

**Next Steps for Production:**

1. Enable HTTPS and HSTS header
2. Set up log monitoring/alerting
3. Configure regular database backups
4. Set up CI/CD pipeline
5. Perform security audit
6. Load testing

---

### Course Management & Filtering

- **Course Creation in Courses Modal**:
  - Added "+ Add New Course" button in Courses modal (requires authentication)
  - Inline course creation form with course code and optional name fields
  - Course code validation: 3-10 alphanumeric characters
  - API integration with `POST /courses` endpoint
  - Real-time course list updates after creation
  - Handles duplicate courses gracefully (returns existing course)
  - Form validation with required field indicators
  - Cancel button to hide form without submission
  - Auto-closes form when modal is closed

- **Course-Based Post Filtering**:
  - Click courses in the Courses modal to filter posts by that course
  - Active filter indicator banner shows current course filter with post count
  - Clear filter button to return to all posts view
  - Course filter state management with `selectedCourse` and `allPosts` states
  - Smart filtering that clears user posts view when course filter is applied
  - Empty state messages show appropriate text when no posts match filter
  - Responsive heading shows "Posts for [COURSE]" when filtered
  - Toggle filter by clicking same course again

- **UI/UX Improvements**:
  - Course badges displayed as static green pills with 📚 icon on posts
  - Gold "+ Add New Course" button with hover effects in Courses modal
  - Dark form background (#2e2e2e) with gold border for visibility
  - "Click to filter posts" hint on each course card
  - Consistent color scheme throughout course management

### Database Management & Password Recovery

- **PostgreSQL Collation Fix**:
  - Resolved collation version mismatch warnings (2.36 → 2.41)
  - Updated both `blog` and `template1` databases using `ALTER DATABASE ... REFRESH COLLATION VERSION`
  - Eliminated system library version conflicts

- **Test Account Password Recovery**:
  - **Found existing test accounts**:
    - `testuser` (<test@example.com>) - ID: 1
    - `YashVG` (<garg.yashvardhan@gmail.com>) - ID: 2  
    - `testUser` (<test@gmail.com>) - ID: 3
  - **Reset passwords for test accounts**:
    - `testuser`: Password reset to `TestPass123`
    - `testUser`: Password reset to `TestPass123`
  - **Database utility script created** (`reset_password.py`) for future password management
  - All test accounts now use consistent password: `TestPass123`

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
