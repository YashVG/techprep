# Groups Feature Documentation

## Overview
A comprehensive groups feature has been added to the application, allowing users to create groups, manage members, and organize their communities.

## Features Added

### Backend (Flask/Python)

#### 1. Database Models (`backend/models.py`)
- **Group Model**: New model representing groups
  - Fields: `id`, `name`, `description`, `creator_id`, `created_at`, `updated_at`
  - Relationships: Many-to-many with Users through `group_members` table
  - Methods: `to_dict()` with optional member inclusion

- **group_members Association Table**: Junction table for User-Group relationship
  - Fields: `user_id`, `group_id`, `joined_at`

#### 2. API Endpoints (`backend/app.py`)

**Group Management:**
- `GET /groups` - List all groups
- `POST /groups` - Create a new group (requires authentication)
- `GET /groups/<id>` - Get group details with members
- `PUT /groups/<id>` - Update group (creator only)
- `DELETE /groups/<id>` - Delete group (creator only)

**Member Management:**
- `POST /groups/<id>/members` - Add member (join group or add others if creator)
- `DELETE /groups/<id>/members/<user_id>` - Remove member (self or creator)
- `GET /users/<id>/groups` - Get all groups for a user

**Security Features:**
- JWT authentication required for create/update/delete operations
- Input sanitization and validation
- Permission checks (creator vs member)
- Rate limiting through existing middleware

#### 3. Database Migration
- Migration file: `a1b2c3d4e5f6_add_groups_and_group_members.py`
- Creates `groups` and `group_members` tables
- To apply: Run `flask db upgrade` or `alembic upgrade head`

### Frontend (React)

#### 1. Components Created

**GroupCard.js / GroupCard.css**
- Display individual group in card format
- Shows: name, description, member count, creator, created date
- Hover effects and responsive design

**GroupDetailModal.js / GroupDetailModal.css**
- Detailed view of a group
- Features:
  - View members list
  - Join/leave group functionality
  - Edit group (creator only)
  - Delete group (creator only)
  - Remove members (creator only)
  - Real-time updates

**CreateGroupForm.js / CreateGroupForm.css**
- Form for creating new groups
- Fields: name (required), description (optional)
- Validation and character limits
- Clean, modern design

#### 2. API Integration (`frontend/src/config/api.js`)
Added GROUPS endpoints:
```javascript
GROUPS: {
  LIST, CREATE, GET, UPDATE, DELETE,
  ADD_MEMBER, REMOVE_MEMBER, USER_GROUPS
}
```

#### 3. App Integration (`frontend/src/App.js`)
- Added "Groups" button to main navigation
- State management for groups
- Handlers for:
  - Fetching groups
  - Creating groups
  - Viewing group details
  - Updating groups
  - Deleting groups
- Modal system for groups list and group details

## How to Use

### For Users

1. **View Groups**
   - Click the "Groups" button in the navigation bar
   - Browse available groups

2. **Create a Group** (requires login)
   - Click "Groups" → "+ Create New Group"
   - Enter group name (required) and description (optional)
   - Click "Create Group"
   - You'll automatically become the first member

3. **Join a Group** (requires login)
   - Click on a group card to view details
   - Click "Join Group" button
   - You'll be added to the members list

4. **Leave a Group** (requires login)
   - Open group details
   - Click "Leave Group"
   - Confirm the action

5. **Manage a Group** (creator only)
   - **Edit**: Click "Edit Group" to change name/description
   - **Delete**: Click "Delete Group" to remove the group
   - **Remove Members**: Click "Remove" next to any member (except yourself)

### For Developers

#### Running Migrations
```bash
cd backend
source venv/bin/activate
flask db upgrade  # or: alembic upgrade head
```

#### API Testing Examples

**Create Group:**
```bash
curl -X POST http://localhost:5001/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Study Group", "description": "For CPSC221"}'
```

**Join Group:**
```bash
curl -X POST http://localhost:5001/groups/1/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Get Group Details:**
```bash
curl http://localhost:5001/groups/1
```

## Architecture Highlights

### Security
- JWT authentication for protected operations
- Input validation and sanitization
- Permission-based access control
- Creator has special privileges

### User Experience
- Intuitive card-based UI
- Modal system for detailed views
- Real-time feedback
- Responsive design for mobile devices
- Consistent styling with existing components

### Database Design
- Many-to-many relationship (Users ↔ Groups)
- Tracks group creator separately
- Timestamps for audit trail
- `joined_at` field for membership tracking

## Future Enhancement Ideas

1. **Group Roles**: Add admin, moderator, member roles
2. **Group Posts**: Allow posts to be associated with groups
3. **Private Groups**: Add public/private group types with invitations
4. **Group Search**: Add search and filter functionality
5. **Group Categories**: Organize groups by category/tags
6. **Member Limits**: Add capacity limits for groups
7. **Group Activity**: Track and display group activity feed
8. **Notifications**: Notify members of group updates

## Files Modified/Created

### Backend
- `backend/models.py` - Added Group model and association table
- `backend/app.py` - Added group API endpoints
- `backend/migrations/versions/a1b2c3d4e5f6_add_groups_and_group_members.py` - New migration

### Frontend
- `frontend/src/config/api.js` - Added group endpoints
- `frontend/src/App.js` - Integrated groups functionality
- `frontend/src/components/GroupCard.js` - New component
- `frontend/src/components/GroupCard.css` - New styles
- `frontend/src/components/GroupDetailModal.js` - New component
- `frontend/src/components/GroupDetailModal.css` - New styles
- `frontend/src/components/CreateGroupForm.js` - New component
- `frontend/src/components/CreateGroupForm.css` - New styles

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Users can view groups list
- [ ] Authenticated users can create groups
- [ ] Group creators can edit their groups
- [ ] Group creators can delete their groups
- [ ] Users can join groups
- [ ] Users can leave groups (except creator when others exist)
- [ ] Group creators can remove members
- [ ] UI is responsive on mobile devices
- [ ] Error messages display correctly
- [ ] Authentication checks work properly

---

**Created**: October 30, 2025  
**Version**: 1.0.0



