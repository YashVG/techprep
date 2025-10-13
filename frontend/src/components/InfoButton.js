import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoButton.css';

/**
 * InfoButton Component
 * Fixed info button at top-left that navigates to About page
 */
const InfoButton = () => {
    const navigate = useNavigate();

    const handleInfoClick = () => {
        navigate('/about');
    };

    return (
        <button
            className="info-button-topleft"
            onClick={handleInfoClick}
            title="About Tech Prep Blog"
        >
            <span className="info-icon">ℹ️</span>
        </button>
    );
};

export default InfoButton;

