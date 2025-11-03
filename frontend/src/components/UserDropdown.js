import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import './UserDropdown.css';

const UserDropdown = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    const handleThemeToggle = () => {
        toggleTheme();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="user-dropdown-fixed" ref={dropdownRef}>
            <button
                className="user-dropdown-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <span className="user-icon">👤</span>
                <span className="user-name">{user?.username}</span>
                <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
            </button>

            {showDropdown && (
                <div className="dropdown-menu">
                    <div className="dropdown-item dropdown-user-info">
                        <strong>{user?.username}</strong>
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                        className="dropdown-item dropdown-theme-toggle"
                        onClick={handleThemeToggle}
                    >
                        <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                        className="dropdown-item dropdown-logout"
                        onClick={handleLogout}
                    >
                        <span className="logout-icon">🚪</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;

