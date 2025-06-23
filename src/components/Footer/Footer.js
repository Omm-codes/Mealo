import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>My Food Journal</h3>
          <p>Discover delicious meals, save your favorites, and explore global cuisines.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/favorites">Favorites</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Data Sources</h3>
          <ul>
            <li><a href="https://www.themealdb.com/api.php" target="_blank" rel="noreferrer">TheMealDB API</a></li>
            <li><a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer">Spoonacular API</a></li>
            <li><a href="https://openai.com/api/" target="_blank" rel="noreferrer">OpenAI API</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Tools</h3>
          <ul>
            <li><Link to="/ai-recipe-generator">AI Recipe Generator</Link></li>
            <li><Link to="/meal-planner">Meal Planner</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} My Food Journal. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
