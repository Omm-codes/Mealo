import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchPopularMeals, fetchRandomMeal, fetchCategories } from '../../services/api';
import './Explore.css';

// Predefined categories for better UX
const defaultCategories = [
  { id: 'Popular', name: 'Popular', icon: '🔥' },
  { id: 'Random', name: 'Random', icon: '🎲' },
  { id: 'Trending', name: 'Trending', icon: '⚡' },
  { id: 'Quick', name: 'Quick & Easy', icon: '⏱️' }
];

function Explore() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Popular');

  const loadCategories = useCallback(async () => {
    try {
      const apiCategories = await fetchCategories();
      // Combine default categories with API categories (limited to 4 most popular)
      const popularApiCategories = apiCategories.slice(0, 4).map(cat => ({
        id: cat.strCategory,
        name: cat.strCategory,
        icon: '🍽️'
      }));
      setCategories([...defaultCategories, ...popularApiCategories]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadRecipes(activeCategory);
  }, [activeCategory]);

  const loadRecipes = async (category) => {
    const cacheKey = `explore_${category}`;
    const cacheTimeKey = `explore_${category}_time`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    const currentTime = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    // Check cache
    if (cachedData && cacheTime && (currentTime - parseInt(cacheTime)) < thirtyMinutes) {
      setRecipes(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let meals = [];
      
      if (category === 'Popular') {
        meals = await fetchPopularMeals(12);
      } else if (category === 'Random' || category === 'Trending' || category === 'Quick') {
        const promises = Array(12).fill().map(() => fetchRandomMeal());
        const results = await Promise.all(promises);
        meals = results.filter(meal => meal !== null);
      } else {
        // Fetch by category from API
        const response = await fetch(`${process.env.REACT_APP_MEAL_DB_BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        meals = (data.meals || []).slice(0, 12).map(meal => ({
          ...meal,
          apiSource: 'mealdb'
        }));
      }

      setRecipes(meals);
      localStorage.setItem(cacheKey, JSON.stringify(meals));
      localStorage.setItem(cacheTimeKey, currentTime.toString());
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
    }
    setLoading(false);
  };

  return (
    <div className="explore-container">
      {/* Hero Section */}
      <section className="explore-hero">
        <h1>Explore Recipes</h1>
        <p>Discover delicious meals from around the world</p>
      </section>

      {/* Category Buttons */}
      <section className="category-filter">
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="recipes-section">
        {loading ? (
          <div className="recipes-grid">
            {Array(12).fill().map((_, index) => (
              <Skeleton key={index} type="card" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="recipes-grid">
            {recipes.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No recipes found for this category.</p>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="quick-links">
        <Link to="/search" className="quick-link-btn">
          <span>🔍</span> Advanced Search
        </Link>
        <Link to="/categories" className="quick-link-btn">
          <span>📁</span> All Categories
        </Link>
      </section>
    </div>
  );
}

export default Explore;
