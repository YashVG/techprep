import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to validate token with backend
    const validateToken = async (token) => {
        try {
            const response = await fetch('http://localhost:5001/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                return { valid: true, user: userData.user };
            } else {
                return { valid: false, user: null };
            }
        } catch (error) {
            console.error('Token validation error:', error);
            return { valid: false, user: null };
        }
    };

    useEffect(() => {
        // Check for existing auth data on app load
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            // Validate the stored token with the backend
            validateToken(storedToken).then(({ valid, user: userData }) => {
                if (valid && userData) {
                    setToken(storedToken);
                    setUser(userData);
                } else {
                    // Token is invalid or expired, clear storage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Function to refresh user data from backend
    const refreshUserData = async () => {
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5001/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                updateUser(userData.user);
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUserData,
        isAuthenticated: !!user && !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
