import React, { useState, useEffect } from 'react';
import './GroupDetailModal.css';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';
import { useAuth } from './AuthContext';

/**
 * GroupDetailModal - Enhanced modal with tabs for group details, members, and posts
 * 
 * @param {Object} group - The group object to display
 * @param {Function} onClose - Callback when the modal is closed
 * @param {Function} onUpdate - Callback when the group is updated
 * @param {Function} onDelete - Callback when the group is deleted
 */
function GroupDetailModal({ group: initialGroup, onClose, onUpdate, onDelete }) {
    const { user, token, isAuthenticated } = useAuth();
    const [group, setGroup] = useState(initialGroup);
    const [activeTab, setActiveTab] = useState('about');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: initialGroup.name,
        description: initialGroup.description || ''
    });
    const [loading, setLoading] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [groupPosts, setGroupPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    useEffect(() => {
        // Check if current user is a member
        if (user && group.members) {
            setIsMember(group.members.some(member => member.id === user.id));
        }
    }, [user, group]);

    // Fetch group posts when Posts tab is active
    useEffect(() => {
        if (activeTab === 'posts' && isMember && isAuthenticated) {
            fetchGroupPosts();
        }
    }, [activeTab, isMember, isAuthenticated]);

    const isCreator = user && group.creator_id === user.id;

    const fetchGroupPosts = async () => {
        setPostsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.GROUPS.POSTS(group.id), {
                headers: getAuthHeaders(token)
            });
            if (response.ok) {
                const data = await response.json();
                setGroupPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Failed to fetch group posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

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

    // Generate initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate a consistent color based on name
    const getAvatarColor = (name) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
    };

    return (
        <div className="gdm-overlay" onClick={onClose}>
            <div className="gdm-container" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="gdm-close" onClick={onClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>

                {isEditing ? (
                    /* Edit Form */
                    <form onSubmit={handleUpdateGroup} className="gdm-edit-form">
                        <h2 className="gdm-edit-title">
                            <span className="edit-icon">✏️</span>
                            Edit Group
                        </h2>
                        <div className="gdm-form-field">
                            <label>Group Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                maxLength={100}
                                required
                                placeholder="Enter group name"
                            />
                            <span className="char-count">{editForm.name.length}/100</span>
                        </div>
                        <div className="gdm-form-field">
                            <label>Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                maxLength={1000}
                                rows={4}
                                placeholder="Describe your group..."
                            />
                            <span className="char-count">{editForm.description.length}/1000</span>
                        </div>
                        <div className="gdm-form-actions">
                            <button type="submit" className="gdm-btn gdm-btn-success" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                            <polyline points="17,21 17,13 7,13 7,21"/>
                                            <polyline points="7,3 7,8 15,8"/>
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditForm({ name: group.name, description: group.description || '' });
                                }}
                                className="gdm-btn gdm-btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Header */}
                        <div className="gdm-header">
                            <div 
                                className="gdm-avatar"
                                style={{ background: getAvatarColor(group.name) }}
                            >
                                <span>{getInitials(group.name)}</span>
                            </div>
                            <div className="gdm-header-info">
                                <h2 className="gdm-title">{group.name}</h2>
                                <div className="gdm-meta-row">
                                    <span className="gdm-badge gdm-badge-members">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 010 7.75"/>
                                        </svg>
                                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                                    </span>
                                    {isMember && (
                                        <span className="gdm-badge gdm-badge-status">
                                            {isCreator ? '👑 Owner' : '✓ Member'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="gdm-tabs">
                            <button 
                                className={`gdm-tab ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                About
                            </button>
                            <button 
                                className={`gdm-tab ${activeTab === 'members' ? 'active' : ''}`}
                                onClick={() => setActiveTab('members')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 010 7.75"/>
                                </svg>
                                Members
                                <span className="tab-count">{group.member_count || 0}</span>
                            </button>
                            <button 
                                className={`gdm-tab ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                                Posts
                                {groupPosts.length > 0 && <span className="tab-count">{groupPosts.length}</span>}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="gdm-content">
                            {/* About Tab */}
                            {activeTab === 'about' && (
                                <div className="gdm-about">
                                    {group.description ? (
                                        <div className="gdm-description">
                                            <h3>Description</h3>
                                            <p>{group.description}</p>
                                        </div>
                                    ) : (
                                        <div className="gdm-empty-description">
                                            <span className="empty-icon">📝</span>
                                            <p>No description provided</p>
                                        </div>
                                    )}

                                    <div className="gdm-info-grid">
                                        <div className="gdm-info-item">
                                            <span className="info-icon">👤</span>
                                            <div className="info-content">
                                                <span className="info-label">Created by</span>
                                                <span className="info-value">{group.creator_username}</span>
                                            </div>
                                        </div>
                                        <div className="gdm-info-item">
                                            <span className="info-icon">📅</span>
                                            <div className="info-content">
                                                <span className="info-label">Created</span>
                                                <span className="info-value">{formatDate(group.created_at)}</span>
                                            </div>
                                        </div>
                                        {group.updated_at && group.updated_at !== group.created_at && (
                                            <div className="gdm-info-item">
                                                <span className="info-icon">🔄</span>
                                                <div className="info-content">
                                                    <span className="info-label">Last updated</span>
                                                    <span className="info-value">{formatDate(group.updated_at)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="gdm-actions">
                                        {isAuthenticated && (
                                            <>
                                                {isMember ? (
                                                    <button
                                                        onClick={handleLeaveGroup}
                                                        className="gdm-btn gdm-btn-warning"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <><span className="spinner"></span>Leaving...</>
                                                        ) : (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                                                                    <polyline points="16,17 21,12 16,7"/>
                                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                                </svg>
                                                                Leave Group
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleJoinGroup}
                                                        className="gdm-btn gdm-btn-success"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <><span className="spinner"></span>Joining...</>
                                                        ) : (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                                                    <circle cx="8.5" cy="7" r="4"/>
                                                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                                                </svg>
                                                                Join Group
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {isCreator && (
                                                    <>
                                                        <button
                                                            onClick={() => setIsEditing(true)}
                                                            className="gdm-btn gdm-btn-primary"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                            </svg>
                                                            Edit Group
                                                        </button>
                                                        <button
                                                            onClick={handleDeleteGroup}
                                                            className="gdm-btn gdm-btn-danger"
                                                            disabled={loading}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3,6 5,6 21,6"/>
                                                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                                            </svg>
                                                            Delete Group
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {!isAuthenticated && (
                                            <p className="gdm-login-prompt">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                                </svg>
                                                Login to join this group
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Members Tab */}
                            {activeTab === 'members' && (
                                <div className="gdm-members">
                                    {group.members && group.members.length > 0 ? (
                                        <div className="gdm-members-list">
                                            {group.members.map((member) => (
                                                <div key={member.id} className="gdm-member-item">
                                                    <div 
                                                        className="member-avatar"
                                                        style={{ background: getAvatarColor(member.username) }}
                                                    >
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="member-info">
                                                        <span className="member-name">
                                                            {member.username}
                                                            {member.id === user?.id && (
                                                                <span className="you-badge">You</span>
                                                            )}
                                                        </span>
                                                        {member.id === group.creator_id && (
                                                            <span className="creator-badge">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                                                </svg>
                                                                Owner
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isCreator && member.id !== group.creator_id && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="gdm-btn-remove"
                                                            disabled={loading}
                                                            title="Remove member"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                                                <circle cx="8.5" cy="7" r="4"/>
                                                                <line x1="18" y1="11" x2="23" y2="11"/>
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="gdm-empty-state">
                                            <span className="empty-icon">👥</span>
                                            <p>No members yet</p>
                                            <span className="empty-hint">Be the first to join!</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Posts Tab */}
                            {activeTab === 'posts' && (
                                <div className="gdm-posts">
                                    {!isMember ? (
                                        <div className="gdm-empty-state">
                                            <span className="empty-icon">🔒</span>
                                            <p>Members only</p>
                                            <span className="empty-hint">Join this group to see posts</span>
                                        </div>
                                    ) : postsLoading ? (
                                        <div className="gdm-loading">
                                            <span className="spinner large"></span>
                                            <p>Loading posts...</p>
                                        </div>
                                    ) : groupPosts.length > 0 ? (
                                        <div className="gdm-posts-list">
                                            {groupPosts.map((post) => (
                                                <div key={post.id} className="gdm-post-item">
                                                    <div className="post-header">
                                                        <div 
                                                            className="post-author-avatar"
                                                            style={{ background: getAvatarColor(post.author) }}
                                                        >
                                                            {post.author.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="post-meta">
                                                            <span className="post-author">{post.author}</span>
                                                            <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <h4 className="post-title">{post.title}</h4>
                                                    {post.content && (
                                                        <p className="post-content">
                                                            {post.content.length > 150 
                                                                ? `${post.content.substring(0, 150)}...` 
                                                                : post.content}
                                                        </p>
                                                    )}
                                                    {post.course && (
                                                        <span className="post-course">{post.course}</span>
                                                    )}
                                                    {post.code && (
                                                        <div className="post-code-indicator">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="16,18 22,12 16,6"/>
                                                                <polyline points="8,6 2,12 8,18"/>
                                                            </svg>
                                                            Contains code
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="gdm-empty-state">
                                            <span className="empty-icon">📝</span>
                                            <p>No posts yet</p>
                                            <span className="empty-hint">Be the first to share something!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default GroupDetailModal;
