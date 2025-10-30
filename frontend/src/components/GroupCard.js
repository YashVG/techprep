import React from 'react';
import './GroupCard.css';

/**
 * GroupCard component displays a single group in a card format
 * 
 * @param {Object} group - The group object to display
 * @param {Function} onClick - Callback when the card is clicked
 */
function GroupCard({ group, onClick }) {
    return (
        <div className="group-card" onClick={() => onClick(group)}>
            <div className="group-card-header">
                <h3 className="group-card-name">{group.name}</h3>
                <span className="group-member-count">
                    {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                </span>
            </div>

            {group.description && (
                <p className="group-card-description">
                    {group.description.length > 100
                        ? `${group.description.substring(0, 100)}...`
                        : group.description}
                </p>
            )}

            <div className="group-card-footer">
                <span className="group-creator">
                    Created by: <strong>{group.creator_username}</strong>
                </span>
                <span className="group-created-date">
                    {new Date(group.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="group-card-cta">
                Click to view details
            </div>
        </div>
    );
}

export default GroupCard;



