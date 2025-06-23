import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchMealById } from '../../services/api';
import './Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Fetch details for each favorite meal
    const mealsData = [];
    for (const mealId of savedFavorites) {
      try {
        const meal = await fetchMealById(mealId);
        if (meal) {
          mealsData.push(meal);
        }
      } catch (error) {
        console.error(`Error fetching meal ${mealId}:`, error);
      }
    }
    
    setFavorites(mealsData);
    setLoading(false);
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all your favorites?')) {
      localStorage.setItem('favorites', JSON.stringify([]));
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
          <p>Start exploring recipes and add your favorites to see them here!</p>
          <Link to="/search">Find Recipes</Link>
        </div>
      ) : (
        <div className="meal-grid">
          {favorites.map(meal => (
            <MealCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
