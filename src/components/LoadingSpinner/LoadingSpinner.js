import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', color = '#a0430a' }) {
  const spinnerSizeClass = `spinner-${size}`;
  
  return (
    <div className="loading-spinner-container">
      <div 
        className={`loading-spinner ${spinnerSizeClass}`}
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
}

export default LoadingSpinner;
