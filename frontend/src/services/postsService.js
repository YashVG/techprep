/**
 * Posts Service
 * Handles all post-related API calls
 */

import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

/**
 * Get all posts
 */
export const getAllPosts = async () => {
    const response = await fetch(API_ENDPOINTS.POSTS.LIST);
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
    }
    
    return data;
};

/**
 * Get a single post by ID
 */
export const getPost = async (postId) => {
    const response = await fetch(API_ENDPOINTS.POSTS.GET(postId));
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post');
    }
    
    return data;
};

/**
 * Create a new post
 */
export const createPost = async (token, postData) => {
    const response = await fetch(API_ENDPOINTS.POSTS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(postData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
    }
    
    return data;
};

/**
 * Delete a post
 */
export const deletePost = async (token, postId) => {
    const response = await fetch(API_ENDPOINTS.POSTS.DELETE(postId), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
    }
    
    return data;
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId) => {
    const response = await fetch(API_ENDPOINTS.POSTS.COMMENTS(postId));
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
    }
    
    return data;
};

