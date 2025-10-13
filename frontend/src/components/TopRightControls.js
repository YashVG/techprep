import React from 'react';
import UserDropdown from './UserDropdown';
import './TopRightControls.css';

/**
 * TopRightControls Component
 * Container for user dropdown in the top-right corner
 */
const TopRightControls = () => {
    return (
        <div className="top-right-controls">
            <UserDropdown />
        </div>
    );
};

export default TopRightControls;

