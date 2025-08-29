import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';

const AuthHeader = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleLogout = () => {
        logout();
        // You might want to redirect or show a message here
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            marginBottom: '2rem'
        }}>
            <div>
                <h1 style={{ margin: 0, color: '#333' }}>Tech Prep Blog</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAuthenticated ? (
                    <>
                        <span style={{ color: '#666' }}>
                            Welcome, <strong>{user?.username}</strong>!
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setShowLogin(true)}
                            style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setShowSignUp(true)}
                            style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>

            {/* Modals */}
            <LoginModal
                show={showLogin}
                onClose={() => setShowLogin(false)}
                onSwitchToSignUp={() => {
                    setShowLogin(false);
                    setShowSignUp(true);
                }}
            />

            <SignUpModal
                show={showSignUp}
                onClose={() => setShowSignUp(false)}
                onSwitchToLogin={() => {
                    setShowSignUp(false);
                    setShowLogin(true);
                }}
            />
        </div>
    );
};

export default AuthHeader;
