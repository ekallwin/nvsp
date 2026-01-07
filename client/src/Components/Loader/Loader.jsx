import React from 'react';
import './Loader.css';

export default function Loader({ message }) {
    return (
        <div className="loader-overlay">
            <div className="loader-spinner"></div>
            <div className="loader-text">{message || "Please wait. It may take some while..."}</div>
        </div>
    );
}
