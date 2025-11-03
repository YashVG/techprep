# Group Posts Feature - Implementation Summary

## ✅ Completed Implementation

You now have a fully functional group posts feature where users can create posts that only group members can view!

## What Was Changed

### 🗄️ Database Changes

#### **Post Model** (`backend/models.py`)
- ✅ Added `group_id` field (nullable, foreign key to groups)
- ✅ Added `group` relationship for easy access
- ✅ Updated `__init__` to accept `group_id` parameter
- ✅ Posts with `group_id = None` are public (visible to everyone)
- ✅ Posts with `group_id` set are only visible to group members

#### **Migration** (`backend/migrations/versions/b1c2d3e4f5a6_add_group_id_to_posts.py`)
- ✅ Created migration to add `group_id` column to posts table
- ✅ Added foreign key constraint linking posts to groups

### 🔧 Backend Changes

#### **Post Routes** (`backend/routes/post_routes.py`)

**Updated `GET /posts`**:
- Now filters posts based on user authentication and group membership
- Public posts (no group_id) visible to everyone
- Group posts only visible to members
- Includes `group_id` and `group_name` in response

**Updated `POST /posts`**:
- Accepts optional `group_id` in request body
- Validates group exists and user is a member
- Returns `group_id` and `group_name` in response
- Authorization: User must be a group member to post

#### **Group Routes** (`backend/routes/group_routes.py`)

**New `GET /groups/{id}/posts`**:
- Fetches all posts for a specific group
- Requires authentication
- Authorization: Only group members can access
- Returns posts in descending order (newest first)
- Includes full post details with timestamps

### 🎨 Frontend Changes

#### **API Config** (`frontend/src/config/api.js`)
- ✅ Added `GROUPS.POSTS` endpoint

#### **Groups Service** (`frontend/src/services/groupsService.js`)
- ✅ Added `getGroupPosts(token, groupId)` function
- ✅ Handles authentication
- ✅ Returns group posts with error handling

#### **Posts Service** (`frontend/src/services/postsService.js`)
- ✅ `createPost()` now supports `group_id` parameter
- ✅ `getAllPosts()` automatically filters based on user's group memberships

## 📋 How to Use

### 1. Apply the Database Migration

```bash
cd backend
source venv/bin/activate  # or activate your Python environment
flask db upgrade
```

### 2. Create a Group Post (Frontend)

```javascript
import { createPost } from '../services/postsService';

// In a group context
const postData = {
  title: "Group Discussion",
  content: "Let's discuss the assignment...",
  tags: ["homework"],
  course: "CPSC 110",
  group_id: 5  // <-- Makes it a group post
};

await createPost(token, postData);
```

### 3. Create a Public Post (Frontend)

```javascript
// Without group_id - visible to everyone
const postData = {
  title: "Public Announcement",
  content: "Available to help anyone!",
  // No group_id
};

await createPost(token, postData);
```

### 4. Get Group Posts (Frontend)

```javascript
import { getGroupPosts } from '../services/groupsService';

const result = await getGroupPosts(token, groupId);
console.log(result.posts); // Array of posts
console.log(result.group_name); // Group name
```

### 5. Display Posts with Group Context

```javascript
import { getAllPosts } from '../services/postsService';

const posts = await getAllPosts();

// Each post now includes:
posts.forEach(post => {
  console.log(post.title);
  console.log(post.group_id);    // null for public, number for group posts
  console.log(post.group_name);  // null for public, string for group posts
});
```

## 🔒 Security Features

✅ **Authorization Checks**:
- Users can only post to groups they're members of
- Users can only view group posts for groups they're in
- Non-authenticated users only see public posts

✅ **API Validation**:
- Group existence verified before post creation
- Membership verified on all group operations
- Proper error messages for unauthorized access

✅ **Data Filtering**:
- Backend automatically filters posts based on user's group memberships
- No exposure of private group content to non-members

## 🚀 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/posts` | Optional | Get all accessible posts (public + user's groups) |
| POST | `/posts` | ✅ Yes | Create post (optional group_id) |
| GET | `/groups/{id}/posts` | ✅ Yes | Get all posts for a specific group |
| DELETE | `/posts/{id}` | ✅ Yes | Delete post (must be author) |

## 📊 Response Examples

### Public Post
```json
{
  "id": 1,
  "title": "Public Post",
  "content": "Everyone can see this",
  "author": "john",
  "tags": ["general"],
  "course": null,
  "code": null,
  "group_id": null,
  "group_name": null
}
```

### Group Post
```json
{
  "id": 2,
  "title": "Group Discussion",
  "content": "Only group members see this",
  "author": "jane",
  "tags": ["study"],
  "course": "CPSC 110",
  "code": "def example():\n    pass",
  "group_id": 5,
  "group_name": "Study Squad"
}
```

## ✨ Next Steps for Full Integration

To complete the feature, you'll want to update your UI components:

1. **Add Post Form**: Add a dropdown to select group when creating post
2. **Group Detail View**: Show group posts in the group detail modal
3. **Post List**: Display group badge on posts
4. **Filtering**: Add ability to filter by group in post list
5. **Permissions UI**: Hide "Post to Group" option if not a member

## 📝 Example UI Implementation

### Add Group Selector to Post Creation

```javascript
const AddPost = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  
  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getUserGroups(currentUserId);
      setUserGroups(groups);
    };
    fetchGroups();
  }, []);
  
  const handleSubmit = async (postData) => {
    const data = {
      ...postData,
      group_id: selectedGroup  // Add selected group
    };
    await createPost(token, data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Title, content, etc. */}
      
      <select onChange={(e) => setSelectedGroup(e.target.value || null)}>
        <option value="">Public Post</option>
        {userGroups.map(group => (
          <option key={group.id} value={group.id}>
            Post to: {group.name}
          </option>
        ))}
      </select>
      
      <button type="submit">Create Post</button>
    </form>
  );
};
```

### Show Group Posts in Group Detail

```javascript
const GroupDetail = ({ groupId }) => {
  const [groupPosts, setGroupPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      const result = await getGroupPosts(token, groupId);
      setGroupPosts(result.posts);
    };
    fetchPosts();
  }, [groupId]);
  
  return (
    <div>
      <h2>Group Posts</h2>
      {groupPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

## 🎉 You're All Set!

The backend is fully implemented and ready to use. Just apply the migration and start creating group-specific posts!

See `GROUP_POSTS_FEATURE.md` for detailed API documentation and more usage examples.

