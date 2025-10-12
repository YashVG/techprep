import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { API_ENDPOINTS, getAuthHeaders } from './config/api';

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
        <div className="modal-overlay" style={{ zIndex: 2000, alignItems: 'flex-start', overflowY: 'auto' }}>
            <div className="signup-modal-popup" style={{ minWidth: 600, maxWidth: 900, width: '80vw', minHeight: 600, maxHeight: '90vh', margin: '2em auto', background: '#444950', color: '#ffd700', position: 'relative', overflowY: 'auto' }}>
                <button
                    className="modal-close-btn"
                    onClick={onCancel}
                    aria-label="Cancel"
                >
                    &times;
                </button>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'center', width: '100%' }}>
                    <h2 style={{ color: '#ffd700', marginBottom: 0 }}>Add New Post</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: 400 }}
                        required
                    />
                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: 400, minHeight: 80 }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {/* Course Selection with Add Button */}
                    <div style={{ width: '100%', maxWidth: 400, margin: '1em 0' }}>
                        <label style={{ color: '#ffd700', fontWeight: 600, marginRight: '1em', display: 'block', marginBottom: '0.5em' }}>Course:</label>
                        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                            <select
                                value={course}
                                onChange={e => setCourse(e.target.value)}
                                className="block-centered-input"
                                style={{ flex: 1 }}
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
                                style={{
                                    background: '#ffd700',
                                    color: '#2e2e2e',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    border: 'none',
                                    padding: '0.5em',
                                    cursor: 'pointer',
                                    fontSize: '0.9em',
                                    minWidth: '40px'
                                }}
                                title="Add New Course"
                            >
                                +
                            </button>
                        </div>

                        {/* Add New Course Form */}
                        {showAddCourse && (
                            <div style={{
                                marginTop: '1em',
                                padding: '1em',
                                background: '#2e2e2e',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5em'
                            }}>
                                <h4 style={{ color: '#ffd700', margin: 0, marginBottom: '0.5em', fontSize: '1em' }}>Add New Course</h4>
                                <input
                                    type="text"
                                    placeholder="Course Code (e.g., CPSC221)"
                                    value={newCourseCode}
                                    onChange={e => setNewCourseCode(e.target.value)}
                                    className="block-centered-input"
                                    style={{ width: '100%' }}
                                    pattern="[A-Za-z0-9]{3,10}"
                                    title="3-10 alphanumeric characters"
                                />
                                <input
                                    type="text"
                                    placeholder="Course Name (optional)"
                                    value={newCourseName}
                                    onChange={e => setNewCourseName(e.target.value)}
                                    className="block-centered-input"
                                    style={{ width: '100%' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5em' }}>
                                    <button
                                        type="button"
                                        onClick={handleAddNewCourse}
                                        style={{
                                            background: '#1db954',
                                            color: '#fff',
                                            fontWeight: 700,
                                            borderRadius: '4px',
                                            border: 'none',
                                            padding: '0.5em 1em',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
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
                                        style={{
                                            background: '#888',
                                            color: '#fff',
                                            fontWeight: 700,
                                            borderRadius: '4px',
                                            border: 'none',
                                            padding: '0.5em 1em',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language Selector for Code Editor */}
                    <div style={{ width: '100%', maxWidth: 400, margin: '1em 0' }}>
                        <label htmlFor="code-language-select" style={{ color: '#ffd700', fontWeight: 600, marginRight: '1em' }}>Code Language:</label>
                        <select
                            id="code-language-select"
                            value={language}
                            onChange={handleLanguageChange}
                            style={{ padding: '0.5em 1em', borderRadius: '4px', border: '1.5px solid #ffd700', background: '#2e2e2e', color: '#ffd700', fontWeight: 600 }}
                        >
                            {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Monaco Code Editor */}
                    <div style={{ width: '100%', maxWidth: 700, minHeight: 300, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.25)', margin: '1em 0' }}>
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
                    <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
                        <button type="button" onClick={onCancel} style={{ background: '#888', color: '#fff', fontWeight: 700, borderRadius: '4px', border: 'none', padding: '0.75em 2em', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ background: '#1db954', color: '#fff', fontWeight: 700, borderRadius: '4px', border: 'none', padding: '0.75em 2em', cursor: 'pointer' }}>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPost; 