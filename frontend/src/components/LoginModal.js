import React, { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import './AuthModal.css';

/**
 * LoginModal - Modern login modal with the design system
 */
const LoginModal = ({ show, onClose, onSwitchToSignUp }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    username: formData.username,
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
                setErrors({ general: data.error || 'Login failed' });
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
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                            <polyline points="10,17 15,12 10,7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to continue to TechPrep</p>
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
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && (
                            <span className="auth-error">{errors.username}</span>
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
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>
                        {errors.password && (
                            <span className="auth-error">{errors.password}</span>
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
                                Signing In...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                                    <polyline points="10,17 15,12 10,7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <button
                        type="button"
                        onClick={onSwitchToSignUp}
                        className="auth-switch-btn"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
