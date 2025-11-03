/**
 * Comments Service
 * Handles all comment-related API calls
 */

import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

/**
 * Create a new comment
 */
export const createComment = async (token, commentData) => {
    const response = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(commentData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
    }
    
    return data;
};

