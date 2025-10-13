import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

/**
 * BackButton Component
 * Navigates back to the home page from the About page
 */
const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            className="back-button"
            onClick={() => navigate('/')}
            title="Back to Home"
        >
            <span className="back-arrow">←</span>
            <span className="back-text">Back to Home</span>
        </button>
    );
};

export default BackButton;

