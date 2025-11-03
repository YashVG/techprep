/**
 * Courses Service
 * Handles all course-related API calls
 */

import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

/**
 * Get all courses
 */
export const getAllCourses = async () => {
    const response = await fetch(API_ENDPOINTS.COURSES.LIST);
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
    }
    
    return data;
};

/**
 * Create a new course
 */
export const createCourse = async (token, courseData) => {
    const response = await fetch(API_ENDPOINTS.COURSES.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(courseData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
    }
    
    return data;
};

/**
 * Delete a course
 */
export const deleteCourse = async (token, courseId) => {
    const response = await fetch(API_ENDPOINTS.COURSES.DELETE(courseId), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
    }
    
    return data;
};

