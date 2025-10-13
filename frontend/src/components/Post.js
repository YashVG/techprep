import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './Post.css';

const Post = ({
    post,
    comments,
    visibleComments,
    showCommentFormFor,
    handleViewComments,
    handleDeletePost,
    setShowCommentFormFor,
    setComments,
    setVisibleComments,
    onAddComment,
    isAuthenticated,
    currentUser,
    onCourseClick
}) => {
    const [showFullscreenCode, setShowFullscreenCode] = useState(false);
    const [showSidebarCommentForm, setShowSidebarCommentForm] = useState(false);
    const postCardRef = useRef(null);
    const [postHeight, setPostHeight] = useState(null);

    useEffect(() => {
        if (postCardRef.current) {
            setPostHeight(postCardRef.current.offsetHeight);
        }
    }, [post, showSidebarCommentForm, comments.length]);

    // Count lines in the code
    const codeLines = post.code ? post.code.split('\n').length : 0;
    const shouldShowFullscreenButton = codeLines > 10;
    const editorHeight = Math.max(80, Math.min(codeLines * 24, 300));

    // Layout: post and comments side by side if comments are visible
    const showComments = visibleComments === post.id;

    return (
        <div className={`post-container ${showComments ? 'post-container-with-comments' : ''}`}>
            {/* Main Post Card */}
            <div
                className="post-card post-card-wrapper"
                ref={postCardRef}
            >
                {/* Two-column layout */}
                <div className="post-two-column-layout">
                    {/* LEFT COLUMN: Metadata, Title, Content, Tags, Actions */}
                    <div className="post-left-column">
                        {/* Meta info: author and course badge */}
                        <div className="post-author-top">
                            <span>Asked by <strong style={{ color: '#ffd700' }}>{post.author}</strong></span>
                            {post.course && (
                                <span className="post-course-badge">
                                    {post.course}
                                </span>
                            )}
                        </div>

                        {/* Title and content */}
                        <h2 className="post-title">{post.title}</h2>
                        {post.content && <p className="post-content">{post.content}</p>}

                        {/* Tags inline */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags-box" style={{ marginBottom: '1rem' }}>
                                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                    {Array.isArray(post.tags) ? post.tags.map(tag => `#${tag}`).join(' ') : `#${post.tags}`}
                                </span>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="post-row-flex">
                            <div className="post-comments-btn-box">
                                <button onClick={() => handleViewComments(post.id)}>
                                    {showComments ? '💬 Hide Comments' : '💬 Show Comments'}
                                </button>
                            </div>
                            {isAuthenticated && currentUser && currentUser.username === post.author && (
                                <div className="post-delete-btn-box">
                                    <button onClick={() => handleDeletePost(post.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Code Editor */}
                    <div className="post-right-column">
                        {/* Code Editor Section - THE MAIN FOCUS */}
                        {post.code && (
                            <div className="post-code-section">
                                <div
                                    className="post-code-editor-wrapper"
                                    style={{ height: shouldShowFullscreenButton ? `${editorHeight}px` : 'auto' }}
                                >
                                    <MonacoEditor
                                        height={editorHeight + 'px'}
                                        language="python"
                                        theme="vs-dark"
                                        value={post.code || '// No code available'}
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
                                    {shouldShowFullscreenButton && (
                                        <button
                                            onClick={() => setShowFullscreenCode(true)}
                                            className="post-fullscreen-btn"
                                        >
                                            Fullscreen
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fullscreen Code Modal */}
                {showFullscreenCode && (
                    <div className="modal-overlay fullscreen-code-modal-overlay">
                        <div className="fullscreen-code-modal-content">
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowFullscreenCode(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h3 className="fullscreen-code-title">Code: {post.title}</h3>
                            <div className="fullscreen-code-editor-container">
                                <MonacoEditor
                                    height="100%"
                                    language="python"
                                    theme="vs-dark"
                                    value={post.code}
                                    options={{
                                        fontSize: 16,
                                        minimap: { enabled: true },
                                        fontFamily: 'Fira Mono, monospace',
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        readOnly: true,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Comments Sidebar */}
            {showComments && (
                <div className="comments-sidebar">
                    {showSidebarCommentForm ? (
                        // Only show the add comment form, not the comments list or header
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const content = e.target.elements[`sidebar-comment-content-${post.id}`].value;

                                if (onAddComment) {
                                    onAddComment({
                                        content,
                                        post_id: post.id
                                    });
                                }
                                setShowSidebarCommentForm(false);
                            }}
                            className="comment-form sidebar-comment-form"
                        >
                            <h4 className="sidebar-comment-form-title">Add Comment</h4>
                            <textarea
                                name={`sidebar-comment-content-${post.id}`}
                                placeholder="Your comment"
                                required
                                className="block-centered-input sidebar-comment-textarea"
                            />
                            <div className="sidebar-comment-buttons">
                                <button type="submit" className="sidebar-comment-submit-btn">Submit</button>
                                <button type="button" className="sidebar-comment-cancel-btn" onClick={() => setShowSidebarCommentForm(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h4 className="comments-section-title">Comments</h4>
                            {isAuthenticated ? (
                                <button
                                    className="comments-add-btn"
                                    onClick={() => setShowSidebarCommentForm(true)}
                                >
                                    Add Comment
                                </button>
                            ) : (
                                <p className="comments-login-message">
                                    Please login to add comments
                                </p>
                            )}
                            {/* Comments List Scrollable */}
                            {comments.length === 0 ? (
                                <p className="comments-empty-message">No comments yet.</p>
                            ) : (
                                <div
                                    className="comments-list"
                                    style={{ maxHeight: postHeight ? postHeight - 40 : '400px' }}
                                >
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="comment-item">
                                            <p className="comment-content">{comment.content}</p>
                                            <p className="comment-author"><strong>By:</strong> {comment.user}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Post;
