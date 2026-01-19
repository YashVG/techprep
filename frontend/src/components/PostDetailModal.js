import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './PostDetailModal.css';

/**
 * PostDetailModal Component
 * Full detail view of a post with modern design
 */
const PostDetailModal = ({
    post,
    onClose,
    comments,
    isAuthenticated,
    currentUser,
    onAddComment,
    onDeletePost,
    onCourseClick
}) => {
    const [commentContent, setCommentContent] = useState('');
    const [showCommentForm, setShowCommentForm] = useState(false);

    if (!post) return null;

    // Calculate editor height based on code lines
    const codeLines = post.code ? post.code.split('\n').length : 0;
    const editorHeight = Math.max(200, Math.min(codeLines * 24, 600));

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (onAddComment && commentContent.trim()) {
            onAddComment({
                content: commentContent,
                post_id: post.id
            });
            setCommentContent('');
            setShowCommentForm(false);
        }
    };

    // Generate avatar color based on name
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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="pdm-overlay" onClick={onClose}>
            <div className="pdm-container" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="pdm-close" onClick={onClose} aria-label="Close">
                    ×
                </button>

                {/* Scrollable content */}
                <div className="pdm-scroll">
                    {/* Header */}
                    <header className="pdm-header">
                        <h1 className="pdm-title">{post.title}</h1>
                        <div className="pdm-meta">
                            <div className="pdm-author">
                                <div 
                                    className="pdm-author-avatar"
                                    style={{ background: getAvatarColor(post.author) }}
                                >
                                    {post.author?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="pdm-author-info">
                                    <span className="pdm-author-name">{post.author}</span>
                                    {post.created_at && (
                                        <span className="pdm-date">{formatDate(post.created_at)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="pdm-badges">
                                {post.course && (
                                    <button
                                        className="pdm-course-badge"
                                        onClick={() => onCourseClick && onCourseClick(post.course)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                                        </svg>
                                        {post.course}
                                    </button>
                                )}
                                {post.group_name && (
                                    <span className="pdm-group-badge" title="Only visible to group members">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                                        </svg>
                                        {post.group_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    {post.content && (
                        <section className="pdm-content">
                            <p>{post.content}</p>
                        </section>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="pdm-tags">
                            {(Array.isArray(post.tags) ? post.tags : [post.tags]).map((tag, idx) => (
                                <span key={idx} className="pdm-tag">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Code section */}
                    {post.code && (
                        <section className="pdm-code-section">
                            <h3 className="pdm-section-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16,18 22,12 16,6"/>
                                    <polyline points="8,6 2,12 8,18"/>
                                </svg>
                                Code
                            </h3>
                            <div className="pdm-code-wrapper">
                                <MonacoEditor
                                    height={`${editorHeight}px`}
                                    language="python"
                                    theme="vs-dark"
                                    value={post.code}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        fontFamily: "'Fira Code', 'Fira Mono', monospace",
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        readOnly: true,
                                        padding: { top: 16, bottom: 16 },
                                    }}
                                />
                            </div>
                        </section>
                    )}

                    {/* Actions */}
                    {isAuthenticated && currentUser && currentUser.username === post.author && (
                        <div className="pdm-actions">
                            <button
                                className="pdm-delete-btn"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                        onDeletePost(post.id);
                                        onClose();
                                    }
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                Delete Post
                            </button>
                        </div>
                    )}

                    {/* Comments section */}
                    <section className="pdm-comments-section">
                        <h3 className="pdm-section-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                            Comments
                            <span className="pdm-comment-count">{comments.length}</span>
                        </h3>

                        {/* Add comment */}
                        {isAuthenticated ? (
                            !showCommentForm ? (
                                <button
                                    className="pdm-add-comment-btn"
                                    onClick={() => setShowCommentForm(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="16"/>
                                        <line x1="8" y1="12" x2="16" y2="12"/>
                                    </svg>
                                    Add Comment
                                </button>
                            ) : (
                                <form className="pdm-comment-form" onSubmit={handleCommentSubmit}>
                                    <textarea
                                        className="pdm-comment-textarea"
                                        placeholder="Write your comment..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        rows={4}
                                        required
                                        autoFocus
                                    />
                                    <div className="pdm-comment-actions">
                                        <button type="submit" className="pdm-btn pdm-btn-success">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                            </svg>
                                            Submit
                                        </button>
                                        <button
                                            type="button"
                                            className="pdm-btn pdm-btn-secondary"
                                            onClick={() => {
                                                setShowCommentForm(false);
                                                setCommentContent('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="pdm-login-message">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                                Login to add comments
                            </div>
                        )}

                        {/* Comments list */}
                        {comments.length === 0 ? (
                            <div className="pdm-empty-comments">
                                <span className="pdm-empty-icon">💬</span>
                                <p>No comments yet</p>
                                <span className="pdm-empty-hint">Be the first to share your thoughts!</span>
                            </div>
                        ) : (
                            <div className="pdm-comments-list">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="pdm-comment-item">
                                        <div 
                                            className="pdm-comment-avatar"
                                            style={{ background: getAvatarColor(comment.user) }}
                                        >
                                            {comment.user?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="pdm-comment-body">
                                            <div className="pdm-comment-header">
                                                <span className="pdm-comment-author">{comment.user}</span>
                                            </div>
                                            <p className="pdm-comment-content">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
