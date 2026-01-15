import React from 'react';
import './PostCard.css';

/**
 * PostCard Component
 * Modern card view showing title, preview, author, and course
 * Features hover animations and visual hierarchy
 */
const PostCard = ({ post, onClick }) => {
    // Get preview content
    const contentPreview = post.content
        ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
        : 'Click to view code...';

    // Generate avatar color based on author name
    const getAvatarColor = (name) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <article className="post-card" onClick={() => onClick(post)}>
            {/* Accent bar */}
            <div className="post-card-accent" />

            {/* Header with course and code indicator */}
            <header className="post-card-header">
                <div className="post-card-badges">
                    {post.course && (
                        <span className="post-card-course">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                            </svg>
                            {post.course}
                        </span>
                    )}
                    {post.code && (
                        <span className="post-card-code-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="16,18 22,12 16,6"/>
                                <polyline points="8,6 2,12 8,18"/>
                            </svg>
                            Code
                        </span>
                    )}
                </div>
                {post.group_name && (
                    <span className="post-card-group">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                            <path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        {post.group_name}
                    </span>
                )}
            </header>

            {/* Title */}
            <h3 className="post-card-title">{post.title}</h3>

            {/* Content Preview */}
            <p className="post-card-preview">{contentPreview}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="post-card-tags">
                    {(Array.isArray(post.tags) ? post.tags : [post.tags]).slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="post-card-tag">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <footer className="post-card-footer">
                <div className="post-card-author">
                    <div 
                        className="post-card-author-avatar"
                        style={{ background: getAvatarColor(post.author) }}
                    >
                        {post.author?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="post-card-author-info">
                        <span className="post-card-author-name">{post.author}</span>
                        {post.created_at && (
                            <span className="post-card-date">{formatDate(post.created_at)}</span>
                        )}
                    </div>
                </div>
                <div className="post-card-cta">
                    <span>View</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </footer>
        </article>
    );
};

export default PostCard;
