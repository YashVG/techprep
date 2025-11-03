# Group Posts Feature

## Overview

Users can now create posts that are only visible to members of a specific group. This feature provides privacy and context-specific content sharing within groups.

## How It Works

### Backend Changes

#### 1. Database Model Updates

**Post Model** (`backend/models.py`):
- Added `group_id` field (nullable Integer, foreign key to `groups.id`)
- Added `group` relationship to access group details
- Public posts have `group_id = None`
- Group posts have a valid `group_id`

#### 2. Migration

**Migration File**: `backend/migrations/versions/b1c2d3e4f5a6_add_group_id_to_posts.py`

To apply the migration:
```bash
cd backend
source venv/bin/activate  # or use your Python environment
flask db upgrade
```

#### 3. API Endpoints

##### Create Post with Group
**POST** `/posts`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Post Title",
  "content": "Post content...",
  "tags": ["tag1", "tag2"],
  "course": "CPSC 110",
  "code": "// optional code",
  "group_id": 123  // NEW: optional group ID
}
```
- **Authorization**: User must be a member of the group to post in it
- **Response**: Returns post data including `group_id` and `group_name`

##### Get All Posts
**GET** `/posts`
- **Headers**: `Authorization: Bearer <token>` (optional)
- **Behavior**:
  - Returns all **public posts** (group_id is null) for everyone
  - Returns **group posts** only for groups the authenticated user is a member of
  - Unauthenticated users only see public posts
- **Response**: Array of posts with `group_id` and `group_name` fields

##### Get Group Posts
**GET** `/groups/{group_id}/posts`
- **Headers**: `Authorization: Bearer <token>` (required)
- **Authorization**: User must be a member of the group
- **Response**:
```json
{
  "group_id": 123,
  "group_name": "Study Group",
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Content...",
      "author": "username",
      "author_id": 5,
      "tags": ["tag1"],
      "course": "CPSC 110",
      "code": null,
      "group_id": 123,
      "group_name": "Study Group",
      "created_at": "2025-11-03T12:00:00",
      "updated_at": "2025-11-03T12:00:00"
    }
  ]
}
```

### Frontend Changes

#### 1. API Configuration

**Updated**: `frontend/src/config/api.js`
- Added `GROUPS.POSTS: (id) => '/groups/{id}/posts'`

#### 2. Services

**Updated**: `frontend/src/services/groupsService.js`
- Added `getGroupPosts(token, groupId)` function

**Updated**: `frontend/src/services/postsService.js`
- `createPost()` now accepts `group_id` in postData
- `getAllPosts()` automatically filters posts based on group membership

#### 3. Usage in Components

##### Create a Group Post

```javascript
import { createPost } from '../services/postsService';

// Create a post in a group
const handleCreateGroupPost = async () => {
  try {
    const postData = {
      title: "Group Post Title",
      content: "This post is only visible to group members",
      tags: ["study", "help"],
      course: "CPSC 110",
      group_id: selectedGroupId  // Add this to post to a group
    };
    
    const result = await createPost(token, postData);
    console.log('Group post created:', result);
  } catch (error) {
    console.error('Failed to create group post:', error);
  }
};

// Create a public post (visible to everyone)
const handleCreatePublicPost = async () => {
  try {
    const postData = {
      title: "Public Post Title",
      content: "This post is visible to everyone",
      tags: ["general"],
      // No group_id - makes it public
    };
    
    const result = await createPost(token, postData);
    console.log('Public post created:', result);
  } catch (error) {
    console.error('Failed to create public post:', error);
  }
};
```

##### Get Group Posts

```javascript
import { getGroupPosts } from '../services/groupsService';

const handleGetGroupPosts = async (groupId) => {
  try {
    const result = await getGroupPosts(token, groupId);
    console.log('Group posts:', result.posts);
    console.log('Group name:', result.group_name);
  } catch (error) {
    console.error('Failed to fetch group posts:', error);
  }
};
```

##### Display Posts with Group Context

```javascript
import { getAllPosts } from '../services/postsService';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <div className="post-meta">
        <span>By: {post.author}</span>
        {post.group_name && (
          <span className="group-badge">
            📁 {post.group_name}
          </span>
        )}
      </div>
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // This automatically filters based on user's group memberships
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    
    fetchPosts();
  }, []);
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

## Security & Authorization

### Backend Security
1. **Post Creation**: Users can only create posts in groups they're members of
2. **Post Visibility**: Group posts are filtered based on user's group memberships
3. **Group Post Access**: Only group members can view posts via `/groups/{id}/posts`

### Frontend Considerations
1. **Authentication**: Always pass the auth token when creating group posts
2. **Error Handling**: Handle 403 errors when user tries to access restricted posts
3. **UI Feedback**: Show group name on posts to indicate context

## Example Workflow

### 1. User Joins a Group
```javascript
import { addGroupMember } from '../services/groupsService';

const joinGroup = async (groupId) => {
  await addGroupMember(token, groupId);
};
```

### 2. User Creates a Post in the Group
```javascript
import { createPost } from '../services/postsService';

const createGroupPost = async (groupId) => {
  await createPost(token, {
    title: "Study Session Notes",
    content: "Here are my notes from today...",
    group_id: groupId
  });
};
```

### 3. Other Group Members See the Post
```javascript
import { getGroupPosts } from '../services/groupsService';

const viewGroupPosts = async (groupId) => {
  const result = await getGroupPosts(token, groupId);
  // result.posts contains all posts in the group
};
```

### 4. Non-Members Don't See the Post
- When calling `getAllPosts()`, non-members won't see this post
- Trying to access `/groups/{id}/posts` returns 403 error

## Database Schema

```sql
-- posts table now includes:
ALTER TABLE posts ADD COLUMN group_id INTEGER NULL;
ALTER TABLE posts ADD CONSTRAINT posts_group_id_fkey 
  FOREIGN KEY (group_id) REFERENCES groups(id);
```

## Testing

### Manual Testing Checklist

1. **Create Public Post**
   - ✅ Post visible to all users (logged in or not)
   - ✅ `group_id` is null
   - ✅ `group_name` is null

2. **Create Group Post**
   - ✅ Only group members can create
   - ✅ Non-members get 403 error
   - ✅ Post includes `group_id` and `group_name`

3. **View Posts**
   - ✅ Logged out users see only public posts
   - ✅ Logged in users see public + their group posts
   - ✅ Non-members don't see group posts

4. **View Group Posts**
   - ✅ Members can view all group posts
   - ✅ Non-members get 403 error
   - ✅ Returns posts in descending order (newest first)

## Future Enhancements

1. **Post Filtering**: Add UI to filter posts by group
2. **Group Context**: Add "Post to Group" button in group detail view
3. **Notifications**: Notify group members of new posts
4. **Post Privacy**: Add option to make some group posts visible to non-members
5. **Post Comments**: Ensure comments on group posts follow same visibility rules

## Troubleshooting

### "You must be a member of the group to post in it"
- Ensure user has joined the group first via `POST /groups/{id}/members`

### "Failed to fetch group posts"
- Check authentication token is valid
- Verify user is a member of the group

### Group posts not appearing in feed
- Ensure `getAllPosts()` is being called with authentication headers
- Check user's group memberships via `GET /users/{id}/groups`

### Migration Issues
- Make sure you're using the correct Python environment
- Run `flask db current` to check current migration version
- Use `flask db upgrade` to apply pending migrations

