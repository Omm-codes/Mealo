import React, { useState, useEffect } from 'react';
import './FavoriteButton.css';

function FavoriteButton({ mealId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    // Check if the meal is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setIsFavorite(favorites.includes(mealId));
  }, [mealId]);
  
  const toggleFavorite = (e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    
    // Get current favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Toggle favorite status
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(id => id !== mealId);
    } else {
      updatedFavorites = [...favorites, mealId];
    }
    
    // Save updated favorites back to localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };
  
  return (
    <button 
      className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
      onClick={toggleFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span className="heart-icon"></span>
    </button>
  );
}

export default FavoriteButton;
