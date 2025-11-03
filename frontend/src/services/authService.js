/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../config/api';

/**
 * Register a new user
 */
export const register = async (username, email, password) => {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }
    
    return data;
};

/**
 * Login user
 */
export const login = async (username, password) => {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }
    
    return data;
};

/**
 * Logout user
 */
export const logout = async (token) => {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Logout failed');
    }
    
    return data;
};

/**
 * Get user profile
 */
export const getProfile = async (token) => {
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
    }
    
    return data;
};

/**
 * Update user profile
 */
export const updateProfile = async (token, profileData) => {
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
    }
    
    return data;
};

/**
 * Change password
 */
export const changePassword = async (token, currentPassword, newPassword) => {
    const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
    }
    
    return data;
};

/**
 * Validate token with backend
 */
export const validateToken = async (token) => {
    try {
        const data = await getProfile(token);
        return { valid: true, user: data.user };
    } catch (error) {
        console.error('Token validation error:', error);
        return { valid: false, user: null };
    }
};

