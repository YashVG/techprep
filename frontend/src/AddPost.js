import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { API_ENDPOINTS, getAuthHeaders } from './config/api';
import './AddPost.css';

/**
 * Default code snippets for each supported language.
 */
const LANGUAGE_SNIPPETS = {
    javascript: '// Start coding!\nfunction hello() {\n  console.log("Hello, world!");\n}',
    python: '# Start coding!\ndef hello():\n    print("Hello, world!")',
    cpp: '// Start coding!\n#include <iostream>\nint main() {\n    std::cout << "Hello, world!" << std::endl;\n    return 0;\n}',
    java: '// Start coding!\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}'
};

const LANGUAGE_LABELS = {
    javascript: 'JavaScript',
    python: 'Python',
    cpp: 'C++',
    java: 'Java'
};

/**
 * AddPost component - Modern post creation modal with code editor
 */
const AddPost = ({ show, onCancel, onSubmit, courseOptions, onAddCourse, token, userGroups = [] }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [course, setCourse] = useState('');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_SNIPPETS['python']);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourseCode, setNewCourseCode] = useState('');
    const [newCourseName, setNewCourseName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibility, setVisibility] = useState('public'); // 'public' or 'group'
    const [selectedGroupId, setSelectedGroupId] = useState('');

    if (!show) return null;

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGE_SNIPPETS[lang]);
    };

    const handleAddNewCourse = async () => {
        const courseCodePattern = /^[A-Za-z]{4}[0-9]{3}$/;
        const trimmedCode = newCourseCode.trim();
        const trimmedName = newCourseName.trim();

        if (!trimmedCode) {
            alert('Course code is required');
            return;
        }

        if (!courseCodePattern.test(trimmedCode)) {
            alert('Course code must be 4 letters followed by 3 numbers (e.g., CPSC221)');
            return;
        }

        if (!trimmedName) {
            alert('Course name is required');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.COURSES.CREATE, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({
                    code: trimmedCode.toUpperCase(),
                    name: trimmedName
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (onAddCourse) {
                    onAddCourse(result.course);
                }
                setCourse(result.course.code);
                setNewCourseCode('');
                setNewCourseName('');
                setShowAddCourse(false);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to add course');
            }
        } catch (err) {
            console.error('Error adding course:', err);
            alert('Network error. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate group selection if visibility is group-only
        if (visibility === 'group' && !selectedGroupId) {
            alert('Please select a group for group-only posts');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                title,
                content,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                course,
                code,
                language,
                group_id: visibility === 'group' ? parseInt(selectedGroupId) : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ap-overlay" onClick={onCancel}>
            <div className="ap-container" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="ap-close" onClick={onCancel} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>

                <form onSubmit={handleSubmit} className="ap-form">
                    {/* Header */}
                    <div className="ap-header">
                        <div className="ap-header-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="12" y1="18" x2="12" y2="12"/>
                                <line x1="9" y1="15" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <h2 className="ap-title">Create New Post</h2>
                        <p className="ap-subtitle">Share your knowledge with the community</p>
                    </div>

                    {/* Form Content */}
                    <div className="ap-body">
                        {/* Title */}
                        <div className="ap-field">
                            <label className="ap-label">
                                Title <span className="ap-required">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="ap-input"
                                placeholder="What's your post about?"
                                required
                            />
                        </div>

                        {/* Content */}
                        <div className="ap-field">
                            <label className="ap-label">
                                Description <span className="ap-required">*</span>
                            </label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="ap-textarea"
                                placeholder="Explain your code or share what you've learned..."
                                rows={4}
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div className="ap-field">
                            <label className="ap-label">
                                Tags <span className="ap-optional">Optional</span>
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                className="ap-input"
                                placeholder="python, algorithms, data-structures (comma-separated)"
                            />
                        </div>

                        {/* Course Selection */}
                        <div className="ap-field">
                            <label className="ap-label">Course</label>
                            <div className="ap-course-row">
                                <select
                                    value={course}
                                    onChange={e => setCourse(e.target.value)}
                                    className="ap-select"
                                >
                                    <option value="">Select Course</option>
                                    {courseOptions.map(courseOption => (
                                        <option key={courseOption.id || courseOption} value={courseOption.code || courseOption}>
                                            {courseOption.code || courseOption} - {courseOption.name || 'No name'}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowAddCourse(!showAddCourse)}
                                    className="ap-add-course-btn"
                                    title="Add New Course"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="16"/>
                                        <line x1="8" y1="12" x2="16" y2="12"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Add Course Form */}
                            {showAddCourse && (
                                <div className="ap-new-course-form">
                                    <h4 className="ap-new-course-title">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                                        </svg>
                                        Add New Course
                                    </h4>
                                    <input
                                        type="text"
                                        placeholder="Course Code (e.g., CPSC221)"
                                        value={newCourseCode}
                                        onChange={e => setNewCourseCode(e.target.value)}
                                        className="ap-input"
                                        pattern="[A-Za-z]{4}[0-9]{3}"
                                        maxLength="7"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Course Name"
                                        value={newCourseName}
                                        onChange={e => setNewCourseName(e.target.value)}
                                        className="ap-input"
                                        maxLength="100"
                                    />
                                    <div className="ap-new-course-actions">
                                        <button
                                            type="button"
                                            onClick={handleAddNewCourse}
                                            className="ap-btn ap-btn-success ap-btn-sm"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddCourse(false);
                                                setNewCourseCode('');
                                                setNewCourseName('');
                                            }}
                                            className="ap-btn ap-btn-secondary ap-btn-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Visibility Selection */}
                        <div className="ap-field">
                            <label className="ap-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Visibility
                            </label>
                            <div className="ap-visibility-options">
                                <label className={`ap-visibility-option ${visibility === 'public' ? 'ap-visibility-active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={visibility === 'public'}
                                        onChange={(e) => {
                                            setVisibility(e.target.value);
                                            setSelectedGroupId('');
                                        }}
                                    />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="2" y1="12" x2="22" y2="12"/>
                                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                                    </svg>
                                    <span>Public</span>
                                    <small>Visible to everyone</small>
                                </label>
                                <label className={`ap-visibility-option ${visibility === 'group' ? 'ap-visibility-active' : ''} ${userGroups.length === 0 ? 'ap-visibility-disabled' : ''}`}>
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="group"
                                        checked={visibility === 'group'}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        disabled={userGroups.length === 0}
                                    />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 010 7.75"/>
                                    </svg>
                                    <span>Group Only</span>
                                    <small>{userGroups.length === 0 ? 'Join a group first' : 'Only group members can see'}</small>
                                </label>
                            </div>
                            
                            {/* Group Selection */}
                            {visibility === 'group' && userGroups.length > 0 && (
                                <div className="ap-group-select-wrapper">
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="ap-select"
                                        required
                                    >
                                        <option value="">Select a group...</option>
                                        {userGroups.map(group => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Language Selector */}
                        <div className="ap-field">
                            <label className="ap-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16,18 22,12 16,6"/>
                                    <polyline points="8,6 2,12 8,18"/>
                                </svg>
                                Code Language
                            </label>
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="ap-select"
                            >
                                {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Code Editor */}
                        <div className="ap-field">
                            <label className="ap-label">Code</label>
                            <div className="ap-editor-wrapper">
                                <MonacoEditor
                                    height="220px"
                                    language={language === 'cpp' ? 'cpp' : language}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={value => setCode(value)}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        fontFamily: "'Fira Code', 'Fira Mono', monospace",
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        padding: { top: 12, bottom: 12 },
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="ap-footer">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="ap-btn ap-btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ap-btn ap-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="ap-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                    Create Post
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPost;
