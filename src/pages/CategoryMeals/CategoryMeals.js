import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchMealsByCategory } from '../../services/api';
import './CategoryMeals.css';

function CategoryMeals() {
  const { name } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCategoryMeals = async () => {
      setLoading(true);
      try {
        const mealsData = await fetchMealsByCategory(name);
        setMeals(mealsData);
      } catch (error) {
        console.error('Error fetching category meals:', error);
      }
      setLoading(false);
    };

    loadCategoryMeals();
    // Scroll to top when category changes
    window.scrollTo(0, 0);
  }, [name]);

  return (
    <div className="category-meals-container">
      <div className="category-header">
        <h2 className="page-title">
          {name} Recipes
        </h2>
        <Link to="/categories" className="back-to-categories">
          ← Back to Categories
        </Link>
      </div>
      
      {loading ? (
        <div className="meal-grid">
          <Skeleton type="meal-card" count={8} />
        </div>
      ) : meals.length > 0 ? (
        <div className="meal-grid">
          {meals.map(meal => (
            <MealCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      ) : (
        <div className="no-meals-found">
          <h3>No meals found in this category</h3>
          <p>Please try another category</p>
        </div>
      )}
    </div>
  );
}

export default CategoryMeals;