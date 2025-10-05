import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

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
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: showComments ? '2em' : 0,
            width: '100%',
            flexWrap: 'wrap',
        }}>
            {/* Main Post Card */}
            <div
                className="post-card"
                ref={postCardRef}
                style={{
                    position: 'relative',
                    width: '600px',
                    minWidth: '320px',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    marginBottom: '1em',
                    flexShrink: 0,
                }}
            >
                <div className="post-author-top" style={{ position: 'absolute', top: '1em', right: '1.5em', fontSize: '0.95em', color: '#ffd700', opacity: 0.8, textAlign: 'right' }}>
                    <span>By: {post.author}</span>
                </div>
                <h2 className="post-title">{post.title}</h2>
                <h4 className="post-content">{post.content}</h4>

                {/* Course Badge - Display Only */}
                {post.course && (
                    <div style={{ marginBottom: '1em' }}>
                        <span
                            style={{
                                display: 'inline-block',
                                background: '#1db954',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '0.5em 1.2em',
                                fontSize: '0.95em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(29, 185, 84, 0.3)'
                            }}
                        >
                            📚 {post.course}
                        </span>
                    </div>
                )}

                <div className="post-row-flex">
                    <div className="post-tags-box">
                        {post.tags && post.tags.length > 0 && (
                            <span><strong>Tags:</strong> {Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}</span>
                        )}
                    </div>
                    <div className="post-comments-btn-box">
                        <button onClick={() => handleViewComments(post.id)}>
                            {showComments ? 'Hide Comments' : 'Show Comments'}
                        </button>
                    </div>
                    {isAuthenticated && currentUser && currentUser.username === post.author && (
                        <div className="post-delete-btn-box">
                            <button onClick={() => handleDeletePost(post.id)}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Code Editor Section - Always Visible */}
                {post.code && (
                    <div style={{ marginTop: '1em' }}>
                        <div style={{
                            width: '100%',
                            height: shouldShowFullscreenButton ? `${editorHeight}px` : 'auto',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                            marginBottom: '1em',
                            position: 'relative'
                        }}>
                            <MonacoEditor
                                height={editorHeight + 'px'}
                                language="python" // Default to python, you can make this dynamic based on post data
                                theme="vs-dark"
                                value={post.code || '// No code available'}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    fontFamily: 'Fira Mono, monospace',
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    readOnly: true, // Make it read-only since it's just for display
                                }}
                            />
                            {shouldShowFullscreenButton && (
                                <button
                                    onClick={() => setShowFullscreenCode(true)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#1db954',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.9em',
                                        borderRadius: '4px',
                                        border: 'none',
                                        padding: '0.4em 0.8em',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}
                                >
                                    Fullscreen
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Comment Button and Form */}
                {/* The Add Comment button and form are now moved to the sidebar */}

                {/* Fullscreen Code Modal */}
                {showFullscreenCode && (
                    <div className="modal-overlay" style={{ zIndex: 2000 }}>
                        <div style={{
                            background: '#444950',
                            color: '#ffd700',
                            borderRadius: '12px',
                            padding: '2em',
                            width: '90vw',
                            height: '80vh',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowFullscreenCode(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h3 style={{ marginBottom: '1em', textAlign: 'center' }}>Code: {post.title}</h3>
                            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
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
                <div
                    style={{
                        background: '#23262b',
                        color: '#ffd700',
                        borderRadius: '10px',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                        width: '320px',
                        minWidth: '320px',
                        maxWidth: '320px',
                        maxHeight: postHeight ? postHeight - 40 : '500px',
                        overflowY: 'auto',
                        padding: '1.5em 1em',
                        marginTop: '0.5em',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1em',
                        flexShrink: 0,
                    }}
                >
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
                            className="comment-form"
                            style={{ margin: 'auto', width: '100%' }}
                        >
                            <h4 style={{ color: '#ffd700', margin: 0, marginBottom: '1em', textAlign: 'center' }}>Add Comment</h4>
                            <textarea
                                name={`sidebar-comment-content-${post.id}`}
                                placeholder="Your comment"
                                required
                                className="block-centered-input"
                                style={{ width: '100%', marginBottom: '1em' }}
                            />
                            <div style={{ display: 'flex', gap: '1em', marginTop: '0.5em', justifyContent: 'center' }}>
                                <button type="submit" style={{ background: '#1db954', color: '#fff', fontWeight: 700, borderRadius: '4px', border: 'none', padding: '0.5em 2em', cursor: 'pointer' }}>Submit</button>
                                <button type="button" style={{ background: '#888', color: '#fff', fontWeight: 'none', padding: '0.5em 2em', cursor: 'pointer' }} onClick={() => setShowSidebarCommentForm(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h4 style={{ color: '#ffd700', margin: 0, marginBottom: '1em', textAlign: 'center' }}>Comments</h4>
                            {isAuthenticated ? (
                                <button
                                    style={{ background: '#ffd700', color: '#2e2e2e', fontWeight: 700, fontSize: '1em', borderRadius: '4px', border: 'none', padding: '0.5em 2em', cursor: 'pointer', marginBottom: '0.5em' }}
                                    onClick={() => setShowSidebarCommentForm(true)}
                                >
                                    Add Comment
                                </button>
                            ) : (
                                <p style={{ color: '#888', fontSize: '0.9em', textAlign: 'center', marginBottom: '0.5em' }}>
                                    Please login to add comments
                                </p>
                            )}
                            {/* Comments List Scrollable */}
                            {comments.length === 0 ? (
                                <p style={{ color: '#bbb', textAlign: 'center' }}>No comments yet.</p>
                            ) : (
                                <div style={{ maxHeight: postHeight ? postHeight - 40 : '400px', overflowY: 'scroll', marginBottom: '1em', scrollbarWidth: 'thin', scrollbarColor: '#ffd700 #23262b' }}>
                                    {comments.map((comment) => (
                                        <div key={comment.id} style={{ marginBottom: '0.5em', background: '#2e2e2e', borderRadius: '6px', padding: '0.75em 1em' }}>
                                            <p style={{ margin: 0 }}>{comment.content}</p>
                                            <p style={{ margin: 0, fontSize: '0.95em', color: '#1db954' }}><strong>By:</strong> {comment.user}</p>
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
