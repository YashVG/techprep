# API Documentation

Complete API reference for the UBC Tech Prep learning platform - a small space for a group of UBC students to share what they've learned.

## Base URL

```
http://localhost:5001
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "username": "string (3-80 chars, alphanumeric + underscore)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
}
```

**Success Response:** `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true,
    "created_at": "2025-10-05T12:34:56.789",
    "last_login": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input, duplicate username/email
- `429 Too Many Requests`: Rate limit exceeded

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 10 requests per minute

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true,
    "created_at": "2025-10-05T12:34:56.789",
    "last_login": "2025-10-05T14:20:10.123"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials or inactive account
- `429 Too Many Requests`: Rate limit exceeded

---

### Get Profile

Get current user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Success Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true,
    "created_at": "2025-10-05T12:34:56.789",
    "last_login": "2025-10-05T14:20:10.123"
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Authentication:** Required

**Request Body:**

```json
{
  "email": "string (optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid email format or email already exists
- `401 Unauthorized`: Invalid/expired token

---

### Change Password

Change current user's password.

**Endpoint:** `POST /auth/change-password`

**Authentication:** Required

**Rate Limit:** 3 requests per hour

**Request Body:**

```json
{
  "current_password": "string",
  "new_password": "string (same requirements as registration)"
}
```

**Success Response:** `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

- `400 Bad Request`: Missing fields or weak password
- `401 Unauthorized`: Incorrect current password
- `429 Too Many Requests`: Rate limit exceeded

---

### Logout

Logout user (client-side token removal).

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Success Response:** `200 OK`

```json
{
  "message": "Logout successful"
}
```

---

## Post Endpoints

### Get All Posts

Retrieve all blog posts.

**Endpoint:** `GET /posts`

**Success Response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "My First Post",
    "content": "Post content here...",
    "author": "john_doe",
    "tags": ["javascript", "react"],
    "course": "CPSC221",
    "code": "console.log('Hello');"
  }
]
```

---

### Create Post

Create a new blog post.

**Endpoint:** `POST /posts`

**Authentication:** Required

**Request Body:**

```json
{
  "title": "string (1-200 chars, required)",
  "content": "string (1-50000 chars, required)",
  "tags": ["string"] (optional),
  "course": "string (optional)",
  "code": "string (optional)"
}
```

**Success Response:** `201 Created`

```json
{
  "id": 1,
  "title": "My First Post",
  "content": "Post content...",
  "author": "john_doe",
  "tags": ["javascript"],
  "course": "CPSC221",
  "code": "console.log('Hello');"
}
```

---

### Delete Post

Delete a post (author only).

**Endpoint:** `DELETE /posts/{post_id}`

**Authentication:** Required

**Success Response:** `200 OK`

```json
{
  "message": "Post deleted"
}
```

**Error Responses:**

- `403 Forbidden`: Not the post author
- `404 Not Found`: Post doesn't exist

---

## Comment Endpoints

### Get Comments for Post

Retrieve all comments for a specific post.

**Endpoint:** `GET /posts/{post_id}/comments`

**Success Response:** `200 OK`

```json
[
  {
    "id": 1,
    "content": "Great post!",
    "user": "jane_doe",
    "post_id": 1
  }
]
```

---

### Add Comment

Add a comment to a post.

**Endpoint:** `POST /comments`

**Authentication:** Required

**Request Body:**

```json
{
  "content": "string (1-5000 chars, required)",
  "post_id": "integer (required)"
}
```

**Success Response:** `201 Created`

```json
{
  "message": "Comment added",
  "id": 1,
  "user": "john_doe",
  "post_id": 1,
  "content": "Great post!",
  "created_at": "2025-10-05T14:30:00.000"
}
```

---

## Course Endpoints

### Get All Courses

Retrieve all available courses.

**Endpoint:** `GET /courses`

**Success Response:** `200 OK`

```json
[
  {
    "id": 1,
    "code": "CPSC221",
    "name": "Data Structures and Algorithms",
    "created_at": "2025-10-05T10:00:00.000"
  }
]
```

---

### Create Course

Create a new course (or return existing).

**Endpoint:** `POST /courses`

**Authentication:** Required

**Request Body:**

```json
{
  "code": "string (3-10 alphanumeric chars, required)",
  "name": "string (1-100 chars, optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "message": "Course available",
  "course": {
    "id": 1,
    "code": "CPSC221",
    "name": "Data Structures and Algorithms",
    "created_at": "2025-10-05T10:00:00.000"
  }
}
```

---

### Delete Course

Delete a course by ID.

**Endpoint:** `DELETE /courses/{course_id}`

**Authentication:** Required

**Success Response:** `200 OK`

```json
{
  "message": "Course deleted"
}
```

---

## User Endpoints

### Get All Users

Retrieve all users with their posts.

**Endpoint:** `GET /users`

**Success Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "posts": [
      {
        "id": 1,
        "title": "My Post",
        "content": "Content...",
        "tags": ["tag1"],
        "course": "CPSC221",
        "code": "code here"
      }
    ]
  }
]
```

---

### Get User by ID

Retrieve a specific user and their posts.

**Endpoint:** `GET /users/{user_id}`

**Success Response:** `200 OK`

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "posts": [ /* array of posts */ ]
}
```

---

### Get User's Posts

Retrieve all posts by a specific user.

**Endpoint:** `GET /users/{user_id}/posts`

**Success Response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Post Title",
    "content": "Content...",
    "tags": ["tag"],
    "course": "CPSC221",
    "code": "code",
    "user_id": 1,
    "author": "john_doe",
    "created_at": "2025-10-05T12:00:00.000",
    "updated_at": "2025-10-05T13:00:00.000"
  }
]
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Rate limits are applied per IP address. When exceeded, you'll receive:

**Response:** `429 Too Many Requests`

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**Rate Limit Headers** (if implemented):

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the limit resets (Unix timestamp)

---

## Example Usage

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"SecurePass123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePass123"}'
```

**Create Post (authenticated):**

```bash
curl -X POST http://localhost:5001/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Post","content":"Post content here"}'
```

### Using JavaScript (Fetch API)

```javascript
// Login
const response = await fetch('http://localhost:5001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'SecurePass123'
  })
});
const data = await response.json();
const token = data.token;

// Create Post
const postResponse = await fetch('http://localhost:5001/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Post',
    content: 'Post content here'
  })
});
```

---

## Notes

1. **Token Expiration**: JWT tokens expire after 24 hours. Implement token refresh or re-authentication.
2. **CORS**: Configure allowed origins in production via `CORS_ORIGINS` environment variable.
3. **HTTPS**: Always use HTTPS in production to protect tokens and sensitive data.
4. **Content Sanitization**: HTML content is sanitized server-side to prevent XSS attacks.
