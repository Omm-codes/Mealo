import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';

function PageNotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <span className="icon-plate">🍽️</span>
          
        </div>
        
        <h1>404 - Page Not Found</h1>
        
        <p className="not-found-message">
          Oops! Looks like this dish isn't on our menu.
        </p>
        
        <p className="not-found-subtext">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="action-button primary">
            Go to Homepage
          </Link>
          
          <Link to="/search" className="action-button secondary">
            Search for Recipes
          </Link>
        </div>
        
        <div className="suggestion-section">
          <h2>Maybe you'd like to try:</h2>
          <div className="suggestion-links">
            <Link to="/categories">Browse Categories</Link>
            <Link to="/ai-recipe-generator">AI Recipe Generator</Link>
            <Link to="/favorites">Your Favorites</Link>
            <Link to="/meal-planner">Meal Planner</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
