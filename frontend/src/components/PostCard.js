import React from 'react';
import './PostCard.css';

/**
 * PostCard Component
 * Compact card view showing title, preview, and course
 * Clicking opens the full post detail modal
 */
const PostCard = ({ post, onClick }) => {
    // Get first 100 characters of content
    const contentPreview = post.content
        ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
        : 'Click to view code...';

    return (
        <div className="post-card-compact" onClick={() => onClick(post)}>
            <div className="post-card-header">
                {post.course && (
                    <span className="post-card-course-badge">{post.course}</span>
                )}
                <span className="post-card-author">by {post.author}</span>
            </div>

            <h3 className="post-card-title">{post.title}</h3>

            <p className="post-card-preview">{contentPreview}</p>

            <div className="post-card-footer">
                {post.tags && post.tags.length > 0 && (
                    <div className="post-card-tags">
                        {Array.isArray(post.tags)
                            ? post.tags.slice(0, 3).map(tag => `#${tag}`).join(' ')
                            : `#${post.tags}`}
                    </div>
                )}
                <span className="post-card-cta">Click to view →</span>
            </div>
        </div>
    );
};

export default PostCard;

