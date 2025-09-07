import { useEffect, useState } from 'react';
import './App.css';
import Post from './components/Post';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddPost from './AddPost';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthHeader from './components/AuthHeader';

function AppContent() {
  const [posts, setPosts] = useState([]);
  const [visibleComments, setVisibleComments] = useState(null); // holds postId
  const [comments, setComments] = useState([]);                 // holds fetched comments
  const [courseOptions, setCourseOptions] = useState([]); // Remove hardcoded courses
  const [showCommentFormFor, setShowCommentFormFor] = useState(null);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false); // shows user's posts when "My Posts" is clicked
  const [showCourses, setShowCourses] = useState(false); // shows all courses when "Show Courses" is clicked
  const { user, token, isAuthenticated, logout } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/courses');
      if (response.ok) {
        const courses = await response.json();
        setCourseOptions(courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchUserPosts = async () => {
    if (!isAuthenticated || !user) {
      alert('Please login to view your posts');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/users/${user.id}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userPosts = await response.json();
        setPosts(userPosts);
      } else {
        if (handleApiError(response, 'Failed to fetch user posts')) {
          return; // Authentication error handled
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to fetch user posts');
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      alert('Network error. Please try again.');
    }
  };

  // Fetch all posts
  const fetchAllPosts = async () => {
    try {
      const response = await fetch('http://localhost:5001/posts');
      if (response.ok) {
        const allPosts = await response.json();
        setPosts(allPosts);
      }
    } catch (err) {
      console.error('Error fetching all posts:', err);
      alert('Network error. Please try again.');
    }
  };

  useEffect(() => {
    fetch('http://localhost:5001/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("Failed to fetch posts:", err));
  }, []);

  const handleViewComments = async (postId) => {
    // Toggle off if same post is clicked
    if (visibleComments === postId) {
      setVisibleComments(null);
      setComments([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data);
      setVisibleComments(postId);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  // Enhanced error handling for API calls
  const handleApiError = (response, errorMessage) => {
    if (response.status === 401) {
      // Token expired or invalid
      alert('Your session has expired. Please login again.');
      logout();
      return true; // Indicates authentication error
    }
    return false;
  };

  // Enhanced post submission with better error handling
  const handleAddPostSubmit = async (postData) => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts([...posts, createdPost]);
        setShowAddPost(false);
      } else {
        if (handleApiError(response, 'Failed to create post')) {
          return; // Authentication error handled
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      alert('Network error. Please try again.');
    }
  };

  // Enhanced comment submission with better error handling
  const handleAddComment = async (commentData) => {
    if (!isAuthenticated) {
      alert('Please login to add comments');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setShowCommentFormFor(null);
      } else {
        if (handleApiError(response, 'Failed to add comment')) {
          return; // Authentication error handled
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Network error. Please try again.');
    }
  };

  // Enhanced post deletion with better error handling
  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        if (handleApiError(response, 'Failed to delete post')) {
          return; // Authentication error handled
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Network error. Please try again.');
    }
  };

  // Handle adding new course from AddPost component
  const handleAddCourse = (newCourse) => {
    setCourseOptions([...courseOptions, newCourse]);
  };

  return (
    <div className="App">
      <AuthHeader />
      <div className="button-bar">
        {isAuthenticated ? (
          <button onClick={() => setShowAddPost(true)}>
            {showAddPost ? "Cancel" : "Add Post"}
          </button>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Please login to create posts and comments
          </p>
        )}
      </div>
      <div className="button-bar">
        {isAuthenticated ? (
          <button onClick={() => {
            if (showUserPosts) {
              // If currently showing user posts, go back to all posts
              setShowUserPosts(false);
              fetchAllPosts();
            } else {
              // Show user's posts
              setShowUserPosts(true);
              fetchUserPosts();
            }
          }}>
            {showUserPosts ? "Show All Posts" : "My Posts"}
          </button>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Please login to view your posts
          </p>
        )}
      </div>
      <div className="button-bar">
        <button onClick={() => setShowCourses(true)}>
          Show Courses
        </button>
      </div>

      <AddPost
        show={showAddPost}
        onCancel={() => setShowAddPost(false)}
        onSubmit={handleAddPostSubmit}
        courseOptions={courseOptions}
        onAddCourse={handleAddCourse}
        token={token}
      />

      {/* Courses Popup Modal */}
      {showCourses && (
        <div className="modal-overlay" style={{ zIndex: 2000, alignItems: 'flex-start', overflowY: 'auto' }}>
          <div className="signup-modal-popup" style={{
            minWidth: 600,
            maxWidth: 900,
            width: '80vw',
            minHeight: 400,
            maxHeight: '80vh',
            margin: '2em auto',
            background: '#444950',
            color: '#ffd700',
            position: 'relative',
            overflowY: 'auto'
          }}>
            <button
              className="modal-close-btn"
              onClick={() => setShowCourses(false)}
              aria-label="Close"
            >
              &times;
            </button>

            <div style={{ padding: '1em' }}>
              <h2 style={{ color: '#ffd700', marginBottom: '1.5em', textAlign: 'center' }}>
                Available Courses ({courseOptions.length})
              </h2>

              {courseOptions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#bbb', fontStyle: 'italic', fontSize: '1.1em' }}>
                  No courses available yet. Create a post to add the first course!
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1em',
                  maxHeight: '60vh',
                  overflowY: 'auto'
                }}>
                  {courseOptions.map(course => (
                    <div key={course.id} style={{
                      background: '#2e2e2e',
                      padding: '1em',
                      borderRadius: '8px',
                      border: '1px solid #ffd700',
                      textAlign: 'center',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <h3 style={{
                        margin: '0 0 0.5em 0',
                        color: '#ffd700',
                        fontSize: '1.2em'
                      }}>
                        {course.code}
                      </h3>
                      {course.name && (
                        <p style={{
                          margin: '0 0 0.5em 0',
                          color: '#bbb',
                          fontSize: '0.9em'
                        }}>
                          {course.name}
                        </p>
                      )}
                      <p style={{
                        margin: '0',
                        color: '#888',
                        fontSize: '0.8em'
                      }}>
                        Added: {new Date(course.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2em'
              }}>
                <button
                  onClick={() => setShowCourses(false)}
                  style={{
                    background: '#888',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    padding: '0.75em 2em',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p>{showUserPosts ? "You haven't created any posts yet." : "No posts found."}</p>
      ) : (
        <div>
          {showUserPosts && (
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '1em' }}>
              Your Posts ({posts.length})
            </h2>
          )}
          {posts.map(post => (
            <Post
              key={post.id}
              post={post}
              comments={comments}
              visibleComments={visibleComments}
              showCommentFormFor={showCommentFormFor}
              handleViewComments={handleViewComments}
              handleDeletePost={handleDeletePost}
              setShowCommentFormFor={setShowCommentFormFor}
              setComments={setComments}
              setVisibleComments={setVisibleComments}
              onAddComment={handleAddComment}
              isAuthenticated={isAuthenticated}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;