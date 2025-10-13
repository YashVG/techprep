import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import UserDropdown from './UserDropdown';
import './AuthHeader.css';

const AuthHeader = () => {
    const { isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    return (
        <>
            {/* Fixed User Dropdown at top-right (authenticated) */}
            <UserDropdown />

            {/* Fixed Login/Signup buttons at top-right (not authenticated) */}
            {!isAuthenticated && (
                <div className="auth-header-actions-fixed">
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
                </div>
            )}

            {/* Header with centered title only */}
            <div className="auth-header-container">
                <h1 className="auth-header-title">TechPrep</h1>
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
        </>
    );
};

export default AuthHeader;
