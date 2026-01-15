import React from 'react';
import './GroupCard.css';

/**
 * GroupCard component displays a single group in a card format
 * with modern styling, icons, and membership indicators
 * 
 * @param {Object} group - The group object to display
 * @param {Function} onClick - Callback when the card is clicked
 * @param {Object} currentUser - The currently logged in user (optional)
 */
function GroupCard({ group, onClick, currentUser }) {
    // Check if current user is a member
    const isMember = currentUser && group.members?.some(m => m.id === currentUser.id);
    const isCreator = currentUser && group.creator_id === currentUser.id;

    // Generate initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate a consistent color based on group name
    const getAvatarColor = (name) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div 
            className={`group-card ${isMember ? 'is-member' : ''} ${isCreator ? 'is-creator' : ''}`}
            onClick={() => onClick(group)}
        >
            {/* Status Badge */}
            {(isMember || isCreator) && (
                <div className="group-status-badge">
                    {isCreator ? '👑 Owner' : '✓ Member'}
                </div>
            )}

            {/* Group Avatar */}
            <div 
                className="group-avatar"
                style={{ background: getAvatarColor(group.name) }}
            >
                <span className="group-avatar-initials">{getInitials(group.name)}</span>
            </div>

            {/* Group Info */}
            <div className="group-card-body">
                <h3 className="group-card-name">{group.name}</h3>
                
                {group.description && (
                    <p className="group-card-description">
                        {group.description.length > 80
                            ? `${group.description.substring(0, 80)}...`
                            : group.description}
                    </p>
                )}

                {/* Stats Row */}
                <div className="group-stats">
                    <div className="group-stat">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{group.member_count || 0}</span>
                        <span className="stat-label">{group.member_count === 1 ? 'member' : 'members'}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="group-card-footer">
                    <div className="group-creator-info">
                        <span className="creator-avatar">
                            {group.creator_username?.charAt(0).toUpperCase() || '?'}
                        </span>
                        <span className="creator-name">{group.creator_username || 'Unknown'}</span>
                    </div>
                    <span className="group-date">
                        {new Date(group.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Hover CTA */}
            <div className="group-card-cta">
                <span>View Group</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export default GroupCard;
