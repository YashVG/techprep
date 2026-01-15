import React, { useState } from 'react';
import './CreateGroupForm.css';

/**
 * CreateGroupForm - Enhanced form component for creating new groups
 * Features character counters, validation feedback, and modern styling
 * 
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback when form is cancelled
 */
function CreateGroupForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const MAX_NAME_LENGTH = 100;
    const MAX_DESC_LENGTH = 1000;

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    return 'Group name is required';
                }
                if (value.trim().length < 3) {
                    return 'Name must be at least 3 characters';
                }
                if (value.length > MAX_NAME_LENGTH) {
                    return `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
                }
                return '';
            case 'description':
                if (value.length > MAX_DESC_LENGTH) {
                    return `Description cannot exceed ${MAX_DESC_LENGTH} characters`;
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const nameError = validateField('name', formData.name);
        const descError = validateField('description', formData.description);

        if (nameError || descError) {
            setErrors({ name: nameError, description: descError });
            setTouched({ name: true, description: true });
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined
            });
            // Reset form on success
            setFormData({ name: '', description: '' });
            setErrors({});
            setTouched({});
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNameProgress = () => {
        return (formData.name.length / MAX_NAME_LENGTH) * 100;
    };

    const getDescProgress = () => {
        return (formData.description.length / MAX_DESC_LENGTH) * 100;
    };

    const isFormValid = formData.name.trim().length >= 3 && !errors.name && !errors.description;

    return (
        <div className="cgf-container">
            {/* Header */}
            <div className="cgf-header">
                <div className="cgf-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                </div>
                <h3 className="cgf-title">Create New Group</h3>
                <p className="cgf-subtitle">Build your community and collaborate with others</p>
            </div>

            <form onSubmit={handleSubmit} className="cgf-form">
                {/* Group Name Field */}
                <div className={`cgf-field ${errors.name && touched.name ? 'has-error' : ''} ${formData.name && !errors.name ? 'is-valid' : ''}`}>
                    <label htmlFor="group-name">
                        <span className="label-text">Group Name</span>
                        <span className="required-star">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            id="group-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., CPSC 221 Study Group"
                            maxLength={MAX_NAME_LENGTH}
                            autoComplete="off"
                            autoFocus
                        />
                        {formData.name && !errors.name && (
                            <span className="input-check">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20,6 9,17 4,12"/>
                                </svg>
                            </span>
                        )}
                    </div>
                    <div className="field-footer">
                        {errors.name && touched.name ? (
                            <span className="error-text">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                {errors.name}
                            </span>
                        ) : (
                            <span className="field-hint">Choose a memorable name for your group</span>
                        )}
                        <span className={`char-counter ${formData.name.length > MAX_NAME_LENGTH * 0.9 ? 'warning' : ''}`}>
                            {formData.name.length}/{MAX_NAME_LENGTH}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className={`progress-fill ${getNameProgress() > 90 ? 'warning' : ''}`}
                            style={{ width: `${getNameProgress()}%` }}
                        />
                    </div>
                </div>

                {/* Description Field */}
                <div className={`cgf-field ${errors.description && touched.description ? 'has-error' : ''}`}>
                    <label htmlFor="group-description">
                        <span className="label-text">Description</span>
                        <span className="optional-tag">Optional</span>
                    </label>
                    <div className="input-wrapper">
                        <textarea
                            id="group-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="What's this group about? Share the purpose, goals, or topics you'll cover..."
                            maxLength={MAX_DESC_LENGTH}
                            rows={4}
                        />
                    </div>
                    <div className="field-footer">
                        {errors.description && touched.description ? (
                            <span className="error-text">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                {errors.description}
                            </span>
                        ) : (
                            <span className="field-hint">Help others understand what your group is about</span>
                        )}
                        <span className={`char-counter ${formData.description.length > MAX_DESC_LENGTH * 0.9 ? 'warning' : ''}`}>
                            {formData.description.length}/{MAX_DESC_LENGTH}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className={`progress-fill ${getDescProgress() > 90 ? 'warning' : ''}`}
                            style={{ width: `${getDescProgress()}%` }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="cgf-actions">
                    <button 
                        type="submit" 
                        className="cgf-btn cgf-btn-create" 
                        disabled={loading || !isFormValid}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="16"/>
                                    <line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                                Create Group
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="cgf-btn cgf-btn-cancel"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroupForm;
