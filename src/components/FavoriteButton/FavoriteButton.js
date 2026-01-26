import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '../../services/firestore';
import './FavoriteButton.css';

function FavoriteButton({ mealId, meal }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    checkFavoriteStatus();
  }, [mealId, currentUser]);
  
  const checkFavoriteStatus = async () => {
    if (currentUser) {
      // Check Firestore for logged-in users
      const favorite = await checkIsFavorite(currentUser.uid, mealId);
      setIsFavorite(favorite);
    } else {
      // Check localStorage for non-logged-in users
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setIsFavorite(favorites.some(fav => fav.idMeal === mealId || fav === mealId));
    }
  };
  
  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    
    if (loading) return;
    setLoading(true);
    
    if (currentUser) {
      // Use Firestore for logged-in users
      if (isFavorite) {
        await removeFavorite(currentUser.uid, mealId);
      } else {
        await addFavorite(currentUser.uid, meal || { idMeal: mealId });
      }
    } else {
      // Use localStorage for non-logged-in users
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      let updatedFavorites;
      
      if (isFavorite) {
        updatedFavorites = favorites.filter(fav => 
          (typeof fav === 'object' ? fav.idMeal : fav) !== mealId
        );
      } else {
        updatedFavorites = [...favorites, meal || { idMeal: mealId }];
      }
      
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
    
    setIsFavorite(!isFavorite);
    setLoading(false);
  };
  
  return (
    <button 
      className={`favorite-button ${isFavorite ? 'favorited' : ''} ${loading ? 'loading' : ''}`}
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span className="heart-icon"></span>
    </button>
  );
}

export default FavoriteButton;
