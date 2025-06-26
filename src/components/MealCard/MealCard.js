import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import './MealCard.css';

function MealCard({ meal }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!meal) return null;
  
  // Make sure we have a valid image URL
  const getOptimizedImageUrl = () => {
    let imageUrl = meal.strMealThumb;
    
    if (!imageUrl || imageError) {
      return 'https://via.placeholder.com/300x200?text=No+Image+Available';
    }
    
    // For Spoonacular images, ensure we're using the higher quality version
    if (meal.apiSource === 'spoonacular' && meal.idMeal) {
      // Try to ensure we have a valid Spoonacular image URL
      return `https://spoonacular.com/recipeImages/${meal.idMeal}-556x370.jpg`;
    }
    
    return imageUrl;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Always use the correct ID for navigation based on API source
  const getMealId = () => {
    if (meal.apiSource === 'spoonacular') {
      return meal.id ? meal.id.toString() : '';
    }
    if (meal.idMeal) return meal.idMeal.toString();
    if (meal.id) return meal.id.toString();
    return '';
  };

  return (
    <div className="meal-card">
      <Link to={`/meal/${getMealId()}`} className="meal-card-image-link">
        <div className={`meal-card-image-container ${!imageLoaded ? 'loading' : ''}`}>
          {!imageLoaded && !imageError && <div className="image-placeholder-loader"></div>}
          <img 
            src={getOptimizedImageUrl()}
            alt={meal.strMeal} 
            className="meal-card-image" 
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
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
            <Link to={`/meal/${getMealId()}`}>
              {meal.strMeal}
            </Link>
          </h3>
          <div className="meal-card-favorite">
            <FavoriteButton mealId={getMealId()} />
          </div>
        </div>
        
        <div className="meal-card-meta">
          {meal.strArea && <span className="meal-card-area">{meal.strArea} Cuisine</span>}
          
          <div className="dietary-indicators">
            {meal.vegetarian && <span className="dietary-tag vegetarian" title="Vegetarian">🌱</span>}
            {meal.vegan && <span className="dietary-tag vegan" title="Vegan">🌿</span>}
            {meal.glutenFree && <span className="dietary-tag gluten-free" title="Gluten Free">🌾</span>}
            {meal.dairyFree && <span className="dietary-tag dairy-free" title="Dairy Free">🥛</span>}
          </div>
        </div>
        
        <Link to={`/meal/${getMealId()}`} className="meal-card-button">
          View Recipe
        </Link>
      </div>
    </div>
  );
}

export default MealCard;
