import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFavorites, removeFavorite } from '../../services/firestore';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import './Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  const loadFavorites = async () => {
    setLoading(true);
    
    if (currentUser) {
      // Load from Firestore for logged-in users
      const result = await getFavorites(currentUser.uid);
      if (result.success) {
        setFavorites(result.data);
      }
    } else {
      // Load from localStorage for non-logged-in users
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setFavorites(savedFavorites);
    }
    
    setLoading(false);
  };

  const clearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to clear all your favorites?')) {
      if (currentUser) {
        // Clear from Firestore
        for (const favorite of favorites) {
          await removeFavorite(currentUser.uid, favorite.idMeal);
        }
      } else {
        // Clear from localStorage
        localStorage.setItem('favorites', JSON.stringify([]));
      }
      setFavorites([]);
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h2 className="page-title">Your Favorite Recipes</h2>
        {favorites.length > 0 && (
          <button className="clear-favorites" onClick={clearAllFavorites}>
            Clear All Favorites
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="meal-grid">
          <Skeleton type="meal-card" count={4} />
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-favorites">
          <h3>No Favorite Recipes Yet</h3>
          {!currentUser && (
            <p className="login-message">
              <Link to="/login">Login</Link> to sync your favorites across devices
            </p>
          )}
          <p>Start exploring recipes and add your favorites to see them here!</p>
          <Link to="/search" className="find-recipes-btn">Find Recipes</Link>
        </div>
      ) : (
        <div className="meal-grid">
          {favorites.map(meal => (
            <MealCard key={meal.idMeal ? meal.idMeal.toString() : meal.id.toString()} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
