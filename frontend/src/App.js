import { useEffect, useState } from 'react';
import './App.css';
import Post from './components/Post';
import { BrowserRouter as Router } from 'react-router-dom';
import AddPost from './AddPost';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthHeader from './components/AuthHeader';
import { API_ENDPOINTS, getAuthHeaders } from './config/api';

function AppContent() {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [visibleComments, setVisibleComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [showCommentFormFor, setShowCommentFormFor] = useState(null);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user, token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.COURSES.LIST);
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
      const response = await fetch(API_ENDPOINTS.USERS.POSTS(user.id), {
        headers: getAuthHeaders(token)
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

  const fetchAllPosts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.LIST);
      if (response.ok) {
        const fetchedPosts = await response.json();
        setPosts(fetchedPosts);
        setAllPosts(fetchedPosts);
        setSelectedCourse(null);
      }
    } catch (err) {
      console.error('Error fetching all posts:', err);
      alert('Network error. Please try again.');
    }
  };

  useEffect(() => {
    fetch(API_ENDPOINTS.POSTS.LIST)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setAllPosts(data);
      })
      .catch(err => console.error("Failed to fetch posts:", err));
  }, []);

  const handleViewComments = async (postId) => {
    if (visibleComments === postId) {
      setVisibleComments(null);
      setComments([]);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.POSTS.COMMENTS(postId));
      const data = await response.json();
      setComments(data);
      setVisibleComments(postId);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleApiError = (response, errorMessage) => {
    if (response.status === 401) {
      alert('Your session has expired. Please login again.');
      logout();
      return true;
    }
    return false;
  };

  const handleAddPostSubmit = async (postData) => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.POSTS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts([...posts, createdPost]);
        setShowAddPost(false);
      } else {
        if (handleApiError(response, 'Failed to create post')) {
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleAddComment = async (commentData) => {
    if (!isAuthenticated) {
      alert('Please login to add comments');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setShowCommentFormFor(null);
      } else {
        if (handleApiError(response, 'Failed to add comment')) {
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.POSTS.DELETE(postId), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        if (handleApiError(response, 'Failed to delete post')) {
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleAddCourse = (newCourse) => {
    setCourseOptions([...courseOptions, newCourse]);
  };

  const handleCreateCourse = async (courseData) => {
    if (!isAuthenticated) {
      alert('Please login to create courses');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.COURSES.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const result = await response.json();
        // Update course options if it's a new course
        if (!courseOptions.find(c => c.code === result.course.code)) {
          setCourseOptions([...courseOptions, result.course]);
        }
        setShowAddCourseForm(false);
        alert('Course added successfully!');
      } else {
        if (handleApiError(response, 'Failed to create course')) {
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleCourseFilter = (courseCode) => {
    if (selectedCourse === courseCode) {
      // If same course clicked, clear filter
      setPosts(allPosts);
      setSelectedCourse(null);
      setShowUserPosts(false);
    } else {
      // Filter posts by course
      const filtered = allPosts.filter(post => post.course === courseCode);
      setPosts(filtered);
      setSelectedCourse(courseCode);
      setShowUserPosts(false);
    }
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
        {isAuthenticated ? (
          <button onClick={() => {
            if (showUserPosts) {
              setShowUserPosts(false);
              fetchAllPosts();
            } else {
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
        <button onClick={() => setShowCourses(true)}>
          Courses
        </button>
      </div>

      {/* Active Filter Display */}
      {selectedCourse && (
        <div style={{
          background: '#ffd700',
          color: '#2e2e2e',
          padding: '0.75em 1.5em',
          margin: '1em auto',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1em',
          maxWidth: '600px',
          fontWeight: 600
        }}>
          <span>Filtering by course: <strong>{selectedCourse}</strong></span>
          <button
            onClick={() => {
              setPosts(allPosts);
              setSelectedCourse(null);
            }}
            style={{
              background: '#2e2e2e',
              color: '#ffd700',
              border: 'none',
              borderRadius: '4px',
              padding: '0.4em 1em',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      <AddPost
        show={showAddPost}
        onCancel={() => setShowAddPost(false)}
        onSubmit={handleAddPostSubmit}
        courseOptions={courseOptions}
        onAddCourse={handleAddCourse}
        token={token}
      />

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
              onClick={() => {
                setShowCourses(false);
                setShowAddCourseForm(false);
              }}
              aria-label="Close"
            >
              &times;
            </button>

            <div style={{ padding: '1em' }}>
              <h2 style={{ color: '#ffd700', marginBottom: '1em', textAlign: 'center' }}>
                Available Courses ({courseOptions.length})
              </h2>

              {/* Add Course Button */}
              {isAuthenticated && !showAddCourseForm && (
                <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
                  <button
                    onClick={() => setShowAddCourseForm(true)}
                    style={{
                      background: '#ffd700',
                      color: '#2e2e2e',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.75em 2em',
                      fontSize: '1em',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#ffed4e'}
                    onMouseLeave={(e) => e.target.style.background = '#ffd700'}
                  >
                    + Add New Course
                  </button>
                </div>
              )}

              {/* Add Course Form */}
              {showAddCourseForm && (
                <div style={{
                  background: '#2e2e2e',
                  padding: '1.5em',
                  borderRadius: '8px',
                  marginBottom: '1.5em',
                  border: '2px solid #ffd700'
                }}>
                  <h3 style={{ color: '#ffd700', marginBottom: '1em', textAlign: 'center' }}>
                    Add New Course
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleCreateCourse({
                      code: formData.get('code'),
                      name: formData.get('name')
                    });
                  }}>
                    <div style={{ marginBottom: '1em' }}>
                      <label style={{ display: 'block', marginBottom: '0.5em', color: '#ffd700' }}>
                        Course Code <span style={{ color: '#ff4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        placeholder="e.g., CPSC221"
                        required
                        maxLength={10}
                        style={{
                          width: '100%',
                          padding: '0.75em',
                          borderRadius: '4px',
                          border: '1px solid #555',
                          background: '#1a1a1a',
                          color: '#fff',
                          fontSize: '1em'
                        }}
                      />
                      <p style={{ fontSize: '0.85em', color: '#888', marginTop: '0.3em' }}>
                        3-10 alphanumeric characters
                      </p>
                    </div>
                    <div style={{ marginBottom: '1em' }}>
                      <label style={{ display: 'block', marginBottom: '0.5em', color: '#ffd700' }}>
                        Course Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g., Data Structures and Algorithms"
                        maxLength={100}
                        style={{
                          width: '100%',
                          padding: '0.75em',
                          borderRadius: '4px',
                          border: '1px solid #555',
                          background: '#1a1a1a',
                          color: '#fff',
                          fontSize: '1em'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}>
                      <button
                        type="submit"
                        style={{
                          background: '#1db954',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.75em 2em',
                          fontSize: '1em',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Create Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCourseForm(false)}
                        style={{
                          background: '#888',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.75em 2em',
                          fontSize: '1em',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                    <div
                      key={course.id}
                      onClick={() => {
                        handleCourseFilter(course.code);
                        setShowCourses(false);
                      }}
                      style={{
                        background: '#2e2e2e',
                        padding: '1em',
                        borderRadius: '8px',
                        border: '1px solid #ffd700',
                        textAlign: 'center',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                      <p style={{
                        margin: '0.5em 0 0 0',
                        color: '#1db954',
                        fontSize: '0.85em',
                        fontWeight: 600
                      }}>
                        Click to filter posts
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
                  onClick={() => {
                    setShowCourses(false);
                    setShowAddCourseForm(false);
                  }}
                  style={{
                    background: '#dc3545',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    padding: '0.75em 2em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#c82333'}
                  onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p>
          {showUserPosts
            ? "You haven't created any posts yet."
            : selectedCourse
              ? `No posts found for course ${selectedCourse}.`
              : "No posts found."}
        </p>
      ) : (
        <div>
          {showUserPosts && (
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '1em' }}>
              Your Posts ({posts.length})
            </h2>
          )}
          {selectedCourse && (
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '1em' }}>
              Posts for {selectedCourse} ({posts.length})
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
              onCourseClick={handleCourseFilter}
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