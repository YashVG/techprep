import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import './AuthHeader.css';

const AuthHeader = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleLogout = () => {
        logout();
        // You might want to redirect or show a message here
    };

    return (
        <div className="auth-header-container">
            <div>
                <h1 className="auth-header-title">Tech Prep Blog</h1>
            </div>

            <div className="auth-header-actions">
                {isAuthenticated ? (
                    <>
                        <span className="auth-header-welcome">
                            Welcome, <strong>{user?.username}</strong>!
                        </span>
                        <button
                            onClick={handleLogout}
                            className="auth-header-logout-btn"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="auth-header-login-btn"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setShowSignUp(true)}
                            className="auth-header-signup-btn"
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
