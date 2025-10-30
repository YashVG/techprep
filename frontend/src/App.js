import { useEffect, useState } from 'react';
import './App.css';
import PostCard from './components/PostCard';
import PostDetailModal from './components/PostDetailModal';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddPost from './AddPost';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import AuthHeader from './components/AuthHeader';
import About from './About';
import TopRightControls from './components/TopRightControls';
import InfoButton from './components/InfoButton';
import { API_ENDPOINTS, getAuthHeaders } from './config/api';
import GroupCard from './components/GroupCard';
import GroupDetailModal from './components/GroupDetailModal';
import CreateGroupForm from './components/CreateGroupForm';

function AppContent() {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showGroups, setShowGroups] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { user, token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetchCourses();
    fetchGroups();
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

  const fetchGroups = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.LIST);
      if (response.ok) {
        const groupsData = await response.json();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
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

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    // Fetch comments for this post
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.COMMENTS(post.id));
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handleClosePostDetail = () => {
    setSelectedPost(null);
    setComments([]);
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

    // Validate course code format: 4 letters + 3 numbers
    const courseCodePattern = /^[A-Za-z]{4}[0-9]{3}$/;
    if (!courseCodePattern.test(courseData.code)) {
      alert('Course code must be 4 letters followed by 3 numbers (e.g., CPSC221)');
      return;
    }

    if (!courseData.name || !courseData.name.trim()) {
      alert('Course name is required');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.COURSES.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          code: courseData.code.toUpperCase(),
          name: courseData.name.trim()
        })
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

  const handleCreateGroup = async (groupData) => {
    if (!isAuthenticated) {
      alert('Please login to create groups');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        const result = await response.json();
        setGroups([...groups, result.group]);
        setShowCreateGroup(false);
        alert('Group created successfully!');
      } else {
        if (handleApiError(response, 'Failed to create group')) {
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleGroupClick = async (group) => {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.GET(group.id));
      if (response.ok) {
        const groupData = await response.json();
        setSelectedGroup(groupData);
      }
    } catch (error) {
      console.error('Failed to fetch group details:', error);
    }
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    setSelectedGroup(updatedGroup);
  };

  const handleGroupDelete = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setSelectedGroup(null);
  };

  return (
    <div className="App">
      <InfoButton />
      <TopRightControls />
      <AuthHeader />
      <div className="button-bar">
        {isAuthenticated ? (
          <button onClick={() => setShowAddPost(true)}>
            {showAddPost ? "Cancel" : "Add Post"}
          </button>
        ) : (
          <p className="auth-message">
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
          <p className="auth-message">
            Please login to view your posts
          </p>
        )}
        <button onClick={() => setShowCourses(true)}>
          Courses
        </button>
        <button onClick={() => setShowGroups(true)}>
          Groups
        </button>
      </div>

      {/* Active Filter Display */}
      {selectedCourse && (
        <div className="course-filter-badge">
          <span>Filtering by course: <strong>{selectedCourse}</strong></span>
          <button
            onClick={() => {
              setPosts(allPosts);
              setSelectedCourse(null);
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
        <div className="modal-overlay courses-modal-overlay">
          <div className="signup-modal-popup courses-modal-content">
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

            <div className="courses-modal-inner">
              <h2 className="courses-modal-title">
                Available Courses ({courseOptions.length})
              </h2>

              {/* Add Course Button */}
              {isAuthenticated && !showAddCourseForm && (
                <div className="add-course-btn-container">
                  <button
                    onClick={() => setShowAddCourseForm(true)}
                    className="add-course-btn"
                  >
                    + Add New Course
                  </button>
                </div>
              )}

              {/* Add Course Form */}
              {showAddCourseForm && (
                <div className="add-course-form-container">
                  <h3 className="add-course-form-title">
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
                    <div className="form-field">
                      <label className="form-label">
                        Course Code <span className="form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        placeholder="e.g., CPSC221"
                        required
                        pattern="[A-Za-z]{4}[0-9]{3}"
                        maxLength={7}
                        className="form-input"
                      />
                      <p className="form-help-text">
                        4 letters followed by 3 numbers (e.g., CPSC221)
                      </p>
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        Course Name <span className="form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g., Data Structures and Algorithms"
                        required
                        maxLength={100}
                        className="form-input"
                      />
                    </div>
                    <div className="form-button-group">
                      <button
                        type="submit"
                        className="btn-success"
                      >
                        Create Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCourseForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {courseOptions.length === 0 ? (
                <p className="empty-state-message">
                  No courses available yet. Create a post to add the first course!
                </p>
              ) : (
                <div className="course-grid">
                  {courseOptions.map(course => (
                    <div
                      key={course.id}
                      onClick={() => {
                        handleCourseFilter(course.code);
                        setShowCourses(false);
                      }}
                      className="course-card"
                    >
                      <h3 className="course-card-code">
                        {course.code}
                      </h3>
                      {course.name && (
                        <p className="course-card-name">
                          {course.name}
                        </p>
                      )}
                      <p className="course-card-date">
                        Added: {new Date(course.created_at).toLocaleDateString()}
                      </p>
                      <p className="course-card-cta">
                        Click to filter posts
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-footer">
                <button
                  onClick={() => {
                    setShowCourses(false);
                    setShowAddCourseForm(false);
                  }}
                  className="btn-danger"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups Modal */}
      {showGroups && (
        <div className="modal-overlay groups-modal-overlay">
          <div className="signup-modal-popup groups-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowGroups(false);
                setShowCreateGroup(false);
              }}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="courses-modal-inner">
              <h2 className="courses-modal-title">
                Groups ({groups.length})
              </h2>

              {/* Create Group Button */}
              {isAuthenticated && !showCreateGroup && (
                <div className="add-course-btn-container">
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="add-course-btn"
                  >
                    + Create New Group
                  </button>
                </div>
              )}

              {/* Create Group Form */}
              {showCreateGroup && (
                <CreateGroupForm
                  onSubmit={handleCreateGroup}
                  onCancel={() => setShowCreateGroup(false)}
                />
              )}

              {groups.length === 0 ? (
                <p className="empty-state-message">
                  No groups available yet. Create the first group!
                </p>
              ) : (
                <div className="course-grid">
                  {groups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onClick={handleGroupClick}
                    />
                  ))}
                </div>
              )}

              <div className="modal-footer">
                <button
                  onClick={() => {
                    setShowGroups(false);
                    setShowCreateGroup(false);
                  }}
                  className="btn-danger"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onUpdate={handleGroupUpdate}
          onDelete={handleGroupDelete}
        />
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
        <>
          {showUserPosts && (
            <h2 className="section-header">
              Your Posts ({posts.length})
            </h2>
          )}
          {selectedCourse && (
            <h2 className="section-header">
              Posts for {selectedCourse} ({posts.length})
            </h2>
          )}
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={handlePostClick}
              />
            ))}
          </div>

          {/* Post Detail Modal */}
          {selectedPost && (
            <PostDetailModal
              post={selectedPost}
              comments={comments}
              onClose={handleClosePostDetail}
              isAuthenticated={isAuthenticated}
              currentUser={user}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onCourseClick={handleCourseFilter}
            />
          )}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;