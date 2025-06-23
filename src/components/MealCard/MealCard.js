import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import './MealCard.css';

function MealCard({ meal }) {
  if (!meal) return null;

  return (
    <div className="meal-card">
      <Link to={`/meal/${meal.idMeal}`} className="meal-card-image-link">
        <div className="meal-card-image-container">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="meal-card-image" />
          <div className="meal-card-overlay">
            <span className="view-recipe-text">View Recipe</span>
          </div>
          {meal.strCategory && (
            <div className="meal-card-category">{meal.strCategory}</div>
          )}
          {meal.readyInMinutes && (
            <div className="meal-card-time">
              <span className="time-icon">⏱️</span> {meal.readyInMinutes} min
            </div>
          )}
        </div>
      </Link>
      
      <div className="meal-card-content">
        <div className="meal-card-header">
          <h3 className="meal-card-title" title={meal.strMeal}>
            <Link to={`/meal/${meal.idMeal}`}>
              {meal.strMeal}
            </Link>
          </h3>
          <div className="meal-card-favorite">
            <FavoriteButton mealId={meal.idMeal} />
          </div>
        </div>
        
        <div className="meal-card-meta">
          {meal.strArea && <span className="meal-card-area">{meal.strArea} Cuisine</span>}
          
          {/* Show dietary indicators if available */}
          <div className="dietary-indicators">
            {meal.vegetarian && <span className="dietary-tag vegetarian" title="Vegetarian">🌱</span>}
            {meal.vegan && <span className="dietary-tag vegan" title="Vegan">🌿</span>}
            {meal.glutenFree && <span className="dietary-tag gluten-free" title="Gluten Free">🌾</span>}
            {meal.dairyFree && <span className="dietary-tag dairy-free" title="Dairy Free">🥛</span>}
          </div>
        </div>
        
        <Link to={`/meal/${meal.idMeal}`} className="meal-card-button">
          View Recipe
        </Link>
      </div>
    </div>
  );
}

export default MealCard;
