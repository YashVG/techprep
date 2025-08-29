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
  const [courseOptions, setCourseOptions] = useState(["CPSC221", "MATH200", "STAT200"]);
  const [showCommentFormFor, setShowCommentFormFor] = useState(null);
  const [showAddPost, setShowAddPost] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

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
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Handler for submitting a new post
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
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error submitting post:', err);
    }
  };

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
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
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
