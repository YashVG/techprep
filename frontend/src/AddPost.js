import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { API_ENDPOINTS, getAuthHeaders } from './config/api';
import './AddPost.css';

/**
 * Default code snippets for each supported language.
 * bleh
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
 * AddPost component
 * Full-screen modal/page for creating a new post, including a Monaco code editor.
 * Props:
 *   - show: boolean (whether to show the modal)
 *   - onCancel: function (called when cancel is clicked)
 *   - onSubmit: function (called with post data on submit)
 *   - courseOptions: array of course strings
 */
const AddPost = ({ show, onCancel, onSubmit, courseOptions, onAddCourse, token }) => {
    // State for all post fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [course, setCourse] = useState('');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_SNIPPETS['python']);

    // State for adding new course
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourseCode, setNewCourseCode] = useState('');
    const [newCourseName, setNewCourseName] = useState('');

    if (!show) return null;

    /**
     * Handles language selection changes for the code editor.
     */
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGE_SNIPPETS[lang]);
    };

    /**
     * Handles adding a new course.
     */
    const handleAddNewCourse = async () => {
        if (!newCourseCode.trim()) return;

        try {
            const response = await fetch(API_ENDPOINTS.COURSES.CREATE, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({
                    code: newCourseCode.toUpperCase(),
                    name: newCourseName.trim() || null
                })
            });

            if (response.ok) {
                const result = await response.json();
                // Call the parent's onAddCourse function to update the course list
                if (onAddCourse) {
                    onAddCourse(result.course);
                }
                // Select the newly added course
                setCourse(result.course.code);
                // Reset form and hide add course section
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

    /**
     * Handles form submission.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title,
            content,
            tags: tags.split(',').map(tag => tag.trim()),
            course,
            code,
            language
        });
    };

    return (
        <div className="modal-overlay add-post-modal-overlay">
            <div className="signup-modal-popup add-post-modal-content">
                <button
                    className="modal-close-btn"
                    onClick={onCancel}
                    aria-label="Cancel"
                >
                    &times;
                </button>
                <form onSubmit={handleSubmit} className="add-post-form">
                    <h2 className="add-post-title">Add New Post</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="block-centered-input add-post-input"
                        required
                    />
                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="block-centered-input add-post-textarea"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        className="block-centered-input add-post-input"
                    />
                    {/* Course Selection with Add Button */}
                    <div className="course-selection-container">
                        <label className="course-label">Course:</label>
                        <div className="course-input-row">
                            <select
                                value={course}
                                onChange={e => setCourse(e.target.value)}
                                className="block-centered-input course-select"
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
                                className="course-add-btn"
                                title="Add New Course"
                            >
                                +
                            </button>
                        </div>

                        {/* Add New Course Form */}
                        {showAddCourse && (
                            <div className="inline-course-form">
                                <h4 className="inline-course-title">Add New Course</h4>
                                <input
                                    type="text"
                                    placeholder="Course Code (e.g., CPSC221)"
                                    value={newCourseCode}
                                    onChange={e => setNewCourseCode(e.target.value)}
                                    className="block-centered-input inline-course-input"
                                    pattern="[A-Za-z0-9]{3,10}"
                                    title="3-10 alphanumeric characters"
                                />
                                <input
                                    type="text"
                                    placeholder="Course Name (optional)"
                                    value={newCourseName}
                                    onChange={e => setNewCourseName(e.target.value)}
                                    className="block-centered-input inline-course-input"
                                />
                                <div className="inline-course-buttons">
                                    <button
                                        type="button"
                                        onClick={handleAddNewCourse}
                                        className="inline-course-add-btn"
                                    >
                                        Add Course
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddCourse(false);
                                            setNewCourseCode('');
                                            setNewCourseName('');
                                        }}
                                        className="inline-course-cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language Selector for Code Editor */}
                    <div className="language-selector-container">
                        <label htmlFor="code-language-select" className="language-label">Code Language:</label>
                        <select
                            id="code-language-select"
                            value={language}
                            onChange={handleLanguageChange}
                            className="language-select"
                        >
                            {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Monaco Code Editor */}
                    <div className="code-editor-container">
                        <MonacoEditor
                            height="300px"
                            language={language === 'cpp' ? 'cpp' : language}
                            theme="vs-dark"
                            value={code}
                            onChange={value => setCode(value)}
                            options={{
                                fontSize: 16,
                                minimap: { enabled: false },
                                fontFamily: 'Fira Mono, monospace',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </div>
                    <div className="add-post-actions">
                        <button type="button" onClick={onCancel} className="add-post-cancel-btn">Cancel</button>
                        <button type="submit" className="add-post-submit-btn">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPost; 