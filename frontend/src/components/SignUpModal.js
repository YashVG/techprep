import React, { useState } from 'react';

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
            newErrors.email = 'Please enter a valid UBC student email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
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
            const response = await fetch('http://localhost:5001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Close modal and refresh page or update app state
                onClose();
                window.location.reload(); // Simple approach - you might want to use React state management
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

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="signup-modal-popup">
                <button
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <form
                    onSubmit={handleSubmit}
                    className="form-margin signup-form"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em', marginTop: '2em', width: '100%' }}
                >
                    <h2 style={{ color: '#222', marginBottom: 0, fontWeight: 700 }}>Sign Up</h2>

                    <div className="signup-divider-row" style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '1em 0' }}>
                        <div style={{ flex: 1, height: 1, background: '#eee' }}></div>
                    </div>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: '320px' }}
                        required
                    />
                    {errors.username && <span style={{ color: 'red', fontSize: '0.8em' }}>{errors.username}</span>}

                    <input
                        type="email"
                        name="email"
                        placeholder="Please enter your UBC student email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: '320px' }}
                        required
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8em' }}>{errors.email}</span>}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: '320px' }}
                        required
                    />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.8em' }}>{errors.password}</span>}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="block-centered-input"
                        style={{ width: '100%', maxWidth: '320px' }}
                        required
                    />
                    {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8em' }}>{errors.confirmPassword}</span>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            maxWidth: '320px',
                            background: '#1db954',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1.1em',
                            borderRadius: '4px',
                            border: 'none',
                            padding: '0.75em 0',
                            marginTop: '0.5em',
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    {errors.general && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9em' }}>{errors.general}</p>}

                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '1em' }}>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1db954',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.9em'
                            }}
                        >
                            Sign In
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUpModal; 