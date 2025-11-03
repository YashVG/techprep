/**
 * Users Service
 * Handles all user-related API calls
 */

import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

/**
 * Get all users
 */
export const getAllUsers = async () => {
    const response = await fetch(API_ENDPOINTS.USERS.LIST);
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
    }
    
    return data;
};

/**
 * Get a specific user by ID
 */
export const getUser = async (userId) => {
    const response = await fetch(API_ENDPOINTS.USERS.GET(userId));
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user');
    }
    
    return data;
};

/**
 * Get posts by a specific user
 */
export const getUserPosts = async (token, userId) => {
    const response = await fetch(API_ENDPOINTS.USERS.POSTS(userId), {
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user posts');
    }
    
    return data;
};

