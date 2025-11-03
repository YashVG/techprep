/**
 * Groups Service
 * Handles all group-related API calls
 */

import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

/**
 * Get all groups
 */
export const getAllGroups = async () => {
    const response = await fetch(API_ENDPOINTS.GROUPS.LIST);
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch groups');
    }
    
    return data;
};

/**
 * Get a specific group by ID
 */
export const getGroup = async (groupId) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.GET(groupId));
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch group');
    }
    
    return data;
};

/**
 * Create a new group
 */
export const createGroup = async (token, groupData) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(groupData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
    }
    
    return data;
};

/**
 * Update a group
 */
export const updateGroup = async (token, groupId, groupData) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE(groupId), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(groupData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update group');
    }
    
    return data;
};

/**
 * Delete a group
 */
export const deleteGroup = async (token, groupId) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.DELETE(groupId), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete group');
    }
    
    return data;
};

/**
 * Add a member to a group
 */
export const addGroupMember = async (token, groupId, userId = null) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.ADD_MEMBER(groupId), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userId ? { user_id: userId } : {})
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to add group member');
    }
    
    return data;
};

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (token, groupId, userId) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to remove group member');
    }
    
    return data;
};

/**
 * Get groups for a specific user
 */
export const getUserGroups = async (userId) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.USER_GROUPS(userId));
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user groups');
    }
    
    return data;
};

/**
 * Get all posts for a specific group
 */
export const getGroupPosts = async (token, groupId) => {
    const response = await fetch(API_ENDPOINTS.GROUPS.POSTS(groupId), {
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch group posts');
    }
    
    return data;
};

