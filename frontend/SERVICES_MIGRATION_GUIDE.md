# API Services Migration Guide

## Overview

API calls have been refactored into separate service files organized by context. This makes the codebase more maintainable, testable, and easier to understand.

## New Structure

```
frontend/src/services/
├── index.js              # Central export point
├── authService.js        # Authentication (login, register, logout, profile)
├── postsService.js       # Posts (CRUD operations, comments)
├── commentsService.js    # Comments (create)
├── coursesService.js     # Courses (list, create, delete)
├── usersService.js       # Users (list, get user posts)
└── groupsService.js      # Groups (CRUD, members management)
```

## How to Use

### Import Services

You can import services in two ways:

**Method 1: Import specific functions**

```javascript
import { login, register } from '../services/authService';
import { getAllPosts, createPost } from '../services/postsService';
```

**Method 2: Import entire service**

```javascript
import * as authService from '../services/authService';
import * as postsService from '../services/postsService';

// Usage: authService.login(), postsService.getAllPosts()
```

**Method 3: Import from index (recommended)**

```javascript
import { authService, postsService, groupsService } from '../services';
```

## Migration Examples

### Example 1: AuthContext.js

**Before:**

```javascript
const validateToken = async (token) => {
    try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            headers: getAuthHeaders(token)
        });

        if (response.ok) {
            const userData = await response.json();
            return { valid: true, user: userData.user };
        } else {
            return { valid: false, user: null };
        }
    } catch (error) {
        console.error('Token validation error:', error);
        return { valid: false, user: null };
    }
};
```

**After:**

```javascript
import { validateToken } from '../services/authService';

// Use directly
const result = await validateToken(storedToken);
```

### Example 2: LoginModal.js

**Before:**

```javascript
const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: API_CONFIG.HEADERS,
    body: JSON.stringify({
        username: formData.username,
        password: formData.password
    })
});

const data = await response.json();

if (response.ok) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onClose();
    window.location.reload();
} else {
    setErrors({ general: data.error || 'Login failed' });
}
```

**After:**

```javascript
import { login } from '../services/authService';

try {
    const data = await login(formData.username, formData.password);
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onClose();
    window.location.reload();
} catch (error) {
    setErrors({ general: error.message });
}
```

### Example 3: App.js - Fetch Posts

**Before:**

```javascript
const fetchAllPosts = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.POSTS.LIST);
        if (response.ok) {
            const fetchedPosts = await response.json();
            setPosts(fetchedPosts);
            setAllPosts(fetchedPosts);
            setSelectedCourse(null);
        }
    } catch (err) {
        console.error('Error fetching all posts:', err);
        alert('Network error. Please try again.');
    }
};
```

**After:**

```javascript
import { postsService } from '../services';

const fetchAllPosts = async () => {
    try {
        const fetchedPosts = await postsService.getAllPosts();
        setPosts(fetchedPosts);
        setAllPosts(fetchedPosts);
        setSelectedCourse(null);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        alert(error.message || 'Network error. Please try again.');
    }
};
```

### Example 4: App.js - Fetch User Posts

**Before:**

```javascript
const fetchUserPosts = async () => {
    if (!isAuthenticated || !user) {
        alert('Please login to view your posts');
        return;
    }
    try {
        const response = await fetch(API_ENDPOINTS.USERS.POSTS(user.id), {
            headers: getAuthHeaders(token)
        });
        if (response.ok) {
            const userPosts = await response.json();
            setPosts(userPosts);
        } else {
            if (handleApiError(response, 'Failed to fetch user posts')) {
                return;
            }
            const errorData = await response.json();
            alert(errorData.error || 'Failed to fetch user posts');
        }
    } catch (error) {
        console.error('Failed to fetch user posts:', error);
        alert('Network error. Please try again.');
    }
};
```

**After:**

```javascript
import { usersService } from '../services';

const fetchUserPosts = async () => {
    if (!isAuthenticated || !user) {
        alert('Please login to view your posts');
        return;
    }
    try {
        const userPosts = await usersService.getUserPosts(token, user.id);
        setPosts(userPosts);
    } catch (error) {
        console.error('Failed to fetch user posts:', error);
        alert(error.message || 'Network error. Please try again.');
    }
};
```

### Example 5: Creating a Post

**Before:**

```javascript
const response = await fetch(API_ENDPOINTS.POSTS.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(postData)
});

const data = await response.json();

if (response.ok) {
    alert('Post created successfully!');
} else {
    alert(data.error || 'Failed to create post');
}
```

**After:**

```javascript
import { postsService } from '../services';

try {
    const data = await postsService.createPost(token, postData);
    alert('Post created successfully!');
} catch (error) {
    alert(error.message);
}
```

### Example 6: Groups Operations

**Before:**

```javascript
const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(groupData)
});

const data = await response.json();

if (response.ok) {
    setGroups([...groups, data.group]);
} else {
    alert(data.error || 'Failed to create group');
}
```

**After:**

```javascript
import { groupsService } from '../services';

try {
    const data = await groupsService.createGroup(token, groupData);
    setGroups([...groups, data.group]);
} catch (error) {
    alert(error.message);
}
```

## Benefits

1. **Cleaner Components**: Components focus on UI logic, not API details
2. **Centralized Error Handling**: Consistent error handling across all API calls
3. **Easy Testing**: Services can be mocked easily for unit tests
4. **Better Maintainability**: API logic in one place per domain
5. **Type Safety Ready**: Easy to add TypeScript types later
6. **Reusability**: Same service functions used across multiple components

## Files to Update

### Priority 1 (Authentication)

- [ ] `AuthContext.js`
- [ ] `LoginModal.js`
- [ ] `SignUpModal.js`

### Priority 2 (Main App)

- [ ] `App.js`
- [ ] `AddPost.js`
- [ ] `Post.js`
- [ ] `PostDetailModal.js`

### Priority 3 (Groups)

- [ ] `GroupDetailModal.js`
- [ ] `CreateGroupForm.js`

## API Services Reference

### authService

- `register(username, email, password)`
- `login(username, password)`
- `logout(token)`
- `getProfile(token)`
- `updateProfile(token, profileData)`
- `changePassword(token, currentPassword, newPassword)`
- `validateToken(token)`

### postsService

- `getAllPosts()`
- `getPost(postId)`
- `createPost(token, postData)`
- `deletePost(token, postId)`
- `getPostComments(postId)`

### commentsService

- `createComment(token, commentData)`

### coursesService

- `getAllCourses()`
- `createCourse(token, courseData)`
- `deleteCourse(token, courseId)`

### usersService

- `getAllUsers()`
- `getUser(userId)`
- `getUserPosts(token, userId)`

### groupsService

- `getAllGroups()`
- `getGroup(groupId)`
- `createGroup(token, groupData)`
- `updateGroup(token, groupId, groupData)`
- `deleteGroup(token, groupId)`
- `addGroupMember(token, groupId, userId?)`
- `removeGroupMember(token, groupId, userId)`
- `getUserGroups(userId)`

## Notes

- All service functions return promises
- Errors are thrown and should be caught with try-catch
- Token parameter is required for authenticated endpoints
- Services handle JSON parsing and error responses automatically
