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

      <AddPost
        show={showAddPost}
        onCancel={() => setShowAddPost(false)}
        onSubmit={handleAddPostSubmit}
        courseOptions={courseOptions}
      />

      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div>
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
