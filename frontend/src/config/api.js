/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and settings.
 * This makes it easy to change the API URL for different environments
 * (development, staging, production).
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
    // Base
    BASE: `${API_BASE_URL}`,

    // Authentication
    AUTH: {
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
        PROFILE: `${API_BASE_URL}/auth/profile`,
        CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    },

    // Posts
    POSTS: {
        LIST: `${API_BASE_URL}/posts`,
        CREATE: `${API_BASE_URL}/posts`,
        GET: (id) => `${API_BASE_URL}/posts/${id}`,
        DELETE: (id) => `${API_BASE_URL}/posts/${id}`,
        COMMENTS: (id) => `${API_BASE_URL}/posts/${id}/comments`,
    },

    // Users
    USERS: {
        LIST: `${API_BASE_URL}/users`,
        GET: (id) => `${API_BASE_URL}/users/${id}`,
        POSTS: (id) => `${API_BASE_URL}/users/${id}/posts`,
    },

    // Comments
    COMMENTS: {
        CREATE: `${API_BASE_URL}/comments`,
    },

    // Courses
    COURSES: {
        LIST: `${API_BASE_URL}/courses`,
        CREATE: `${API_BASE_URL}/courses`,
        DELETE: (id) => `${API_BASE_URL}/courses/${id}`,
    },
};

/**
 * API request configuration
 */
export const API_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    HEADERS: {
        'Content-Type': 'application/json',
    },
};

/**
 * Helper function to get authorization headers
 * @param {string} token - JWT token
 * @returns {Object} Headers object with authorization
 */
export const getAuthHeaders = (token) => ({
    ...API_CONFIG.HEADERS,
    'Authorization': `Bearer ${token}`,
});

export default API_ENDPOINTS;

