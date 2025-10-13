import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './PostDetailModal.css';

/**
 * PostDetailModal Component
 * Full detail view of a post with code and comments
 * Similar to StackOverflow's question detail view
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

    return (
        <div className="modal-overlay post-detail-modal-overlay" onClick={onClose}>
            <div className="post-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="modal-close-btn" onClick={onClose}>
                    ×
                </button>

                {/* Scrollable content */}
                <div className="post-detail-scroll-container">
                    {/* Post header */}
                    <div className="post-detail-header">
                        <h1 className="post-detail-title">{post.title}</h1>
                        <div className="post-detail-meta">
                            <span className="post-detail-author">Asked by <strong>{post.author}</strong></span>
                            {post.course && (
                                <span
                                    className="post-detail-course-badge"
                                    onClick={() => onCourseClick && onCourseClick(post.course)}
                                >
                                    {post.course}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div className="post-detail-content">
                            <p>{post.content}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="post-detail-tags">
                            {Array.isArray(post.tags)
                                ? post.tags.map((tag, idx) => (
                                    <span key={idx} className="post-detail-tag">#{tag}</span>
                                ))
                                : <span className="post-detail-tag">#{post.tags}</span>}
                        </div>
                    )}

                    {/* Code section */}
                    {post.code && (
                        <div className="post-detail-code-section">
                            <h3 className="post-detail-section-title">Code</h3>
                            <div className="post-detail-code-wrapper">
                                <MonacoEditor
                                    height={`${editorHeight}px`}
                                    language="python"
                                    theme="vs-dark"
                                    value={post.code}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        fontFamily: 'Fira Mono, monospace',
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        readOnly: true,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="post-detail-actions">
                        {isAuthenticated && currentUser && currentUser.username === post.author && (
                            <button
                                className="post-detail-delete-btn"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                        onDeletePost(post.id);
                                        onClose();
                                    }
                                }}
                            >
                                🗑️ Delete Post
                            </button>
                        )}
                    </div>

                    {/* Comments section */}
                    <div className="post-detail-comments-section">
                        <h3 className="post-detail-section-title">
                            Comments ({comments.length})
                        </h3>

                        {isAuthenticated ? (
                            !showCommentForm ? (
                                <button
                                    className="post-detail-add-comment-btn"
                                    onClick={() => setShowCommentForm(true)}
                                >
                                    💬 Add Comment
                                </button>
                            ) : (
                                <form className="post-detail-comment-form" onSubmit={handleCommentSubmit}>
                                    <textarea
                                        className="post-detail-comment-textarea"
                                        placeholder="Write your comment..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        required
                                    />
                                    <div className="post-detail-comment-buttons">
                                        <button type="submit" className="comment-submit-btn">Submit</button>
                                        <button
                                            type="button"
                                            className="comment-cancel-btn"
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
                            <p className="post-detail-login-message">
                                Please login to add comments
                            </p>
                        )}

                        {/* Comments list */}
                        {comments.length === 0 ? (
                            <p className="post-detail-empty-comments">No comments yet. Be the first to comment!</p>
                        ) : (
                            <div className="post-detail-comments-list">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="post-detail-comment-item">
                                        <div className="comment-left-column">
                                            <div className="comment-avatar">
                                                <span className="comment-author-icon">👤</span>
                                            </div>
                                            <div className="comment-author-name">{comment.user}</div>
                                        </div>
                                        <div className="comment-right-column">
                                            <div className="comment-item-content">{comment.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;

