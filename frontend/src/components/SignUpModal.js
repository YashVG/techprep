import React, { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import './AuthModal.css';

/**
 * SignUpModal - Modern signup modal with the design system
 */
const SignUpModal = ({ show, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@student\.ubc\.ca$/.test(formData.email)) {
            newErrors.email = 'Please use a valid UBC student email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Include uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onClose();
                window.location.reload();
            } else {
                setErrors({ general: data.error || 'Registration failed' });
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!show) return null;

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="auth-close" onClick={onClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>

                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join the TechPrep community</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Username */}
                    <div className="auth-field">
                        <label className="auth-label">Username</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={`auth-input ${errors.username ? 'error' : ''}`}
                                placeholder="Choose a username"
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && (
                            <span className="auth-error">{errors.username}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label">UBC Student Email</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`auth-input ${errors.email ? 'error' : ''}`}
                                placeholder="you@student.ubc.ca"
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && (
                            <span className="auth-error">{errors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`auth-input ${errors.password ? 'error' : ''}`}
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password ? (
                            <span className="auth-error">{errors.password}</span>
                        ) : (
                            <span className="auth-requirements">8+ chars, uppercase, lowercase, number</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="auth-field">
                        <label className="auth-label">Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <span className="auth-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div className="auth-general-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            {errors.general}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="auth-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="8.5" cy="7" r="4"/>
                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                </svg>
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>Already have an account?</p>
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="auth-switch-btn"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpModal;
