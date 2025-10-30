import React, { useState, useEffect } from 'react';
import './GroupDetailModal.css';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';
import { useAuth } from './AuthContext';

/**
 * GroupDetailModal component displays detailed information about a group
 * including members and management options
 * 
 * @param {Object} group - The group object to display
 * @param {Function} onClose - Callback when the modal is closed
 * @param {Function} onUpdate - Callback when the group is updated
 * @param {Function} onDelete - Callback when the group is deleted
 */
function GroupDetailModal({ group: initialGroup, onClose, onUpdate, onDelete }) {
  const { user, token, isAuthenticated } = useAuth();
  const [group, setGroup] = useState(initialGroup);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: initialGroup.name,
    description: initialGroup.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // Check if current user is a member
    if (user && group.members) {
      setIsMember(group.members.some(member => member.id === user.id));
    }
  }, [user, group]);

  const isCreator = user && group.creator_id === user.id;

  const handleJoinGroup = async () => {
    if (!isAuthenticated) {
      alert('Please login to join groups');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.ADD_MEMBER(group.id), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        setIsMember(true);
        onUpdate(data.group);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.GROUPS.REMOVE_MEMBER(group.id, user.id),
        {
          method: 'DELETE',
          headers: getAuthHeaders(token)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        setIsMember(false);
        onUpdate(data.group);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isCreator) return;

    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.GROUPS.REMOVE_MEMBER(group.id, memberId),
        {
          method: 'DELETE',
          headers: getAuthHeaders(token)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        onUpdate(data.group);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      alert('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE(group.id), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        setIsEditing(false);
        onUpdate(data.group);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update group');
      }
    } catch (error) {
      console.error('Failed to update group:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.DELETE(group.id), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (response.ok) {
        onDelete(group.id);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay group-detail-modal-overlay" onClick={onClose}>
      <div className="modal-content group-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {isEditing ? (
          <form onSubmit={handleUpdateGroup} className="group-edit-form">
            <h2>Edit Group</h2>
            <div className="form-field">
              <label>Group Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                maxLength={100}
                required
              />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                maxLength={1000}
                rows={4}
              />
            </div>
            <div className="form-button-group">
              <button type="submit" className="btn-success" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ name: group.name, description: group.description || '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="group-detail-header">
              <h2>{group.name}</h2>
              <span className="group-member-badge">
                {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
              </span>
            </div>

            {group.description && (
              <div className="group-description">
                <p>{group.description}</p>
              </div>
            )}

            <div className="group-meta">
              <p><strong>Created by:</strong> {group.creator_username}</p>
              <p><strong>Created:</strong> {new Date(group.created_at).toLocaleString()}</p>
              {group.updated_at && (
                <p><strong>Last updated:</strong> {new Date(group.updated_at).toLocaleString()}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="group-actions">
              {isAuthenticated && (
                <>
                  {isMember ? (
                    <button
                      onClick={handleLeaveGroup}
                      className="btn-warning"
                      disabled={loading}
                    >
                      {loading ? 'Leaving...' : 'Leave Group'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinGroup}
                      className="btn-success"
                      disabled={loading}
                    >
                      {loading ? 'Joining...' : 'Join Group'}
                    </button>
                  )}

                  {isCreator && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary"
                      >
                        Edit Group
                      </button>
                      <button
                        onClick={handleDeleteGroup}
                        className="btn-danger"
                        disabled={loading}
                      >
                        Delete Group
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Members list */}
            <div className="group-members-section">
              <h3>Members</h3>
              {group.members && group.members.length > 0 ? (
                <div className="members-list">
                  {group.members.map((member) => (
                    <div key={member.id} className="member-item">
                      <span className="member-username">
                        {member.username}
                        {member.id === group.creator_id && (
                          <span className="creator-badge">Creator</span>
                        )}
                      </span>
                      {isCreator && member.id !== group.creator_id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn-remove-member"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No members yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GroupDetailModal;



