import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchPopularMeals, fetchRandomMeal } from '../../services/api';
import './Explore.css';

// Main tabs for navigation
const mainTabs = [
  { id: 'Popular', name: 'Popular', icon: '🔥' },
  { id: 'Trending', name: 'Trending', icon: '⚡' },
  { id: 'Quick', name: 'Quick', icon: '⏱️' },
  { id: 'Indian', name: 'Indian', icon: '🍛' },
  { id: 'Random', name: 'Random', icon: '🎲' }
];

// Quick filter chips
const quickFilters = [
  { id: 'Vegetarian', name: 'Vegetarian', icon: '🥗' },
  { id: 'Under30', name: 'Under 30 mins', icon: '⚡' },
  { id: 'HighProtein', name: 'High Protein', icon: '💪' },
  { id: 'LowCarb', name: 'Low Carb', icon: '🥑' }
];

// Cuisines for exploration
const cuisines = [
  { id: 'Indian', name: 'Indian', flag: '🇮🇳', image: '🍛' },
  { id: 'Italian', name: 'Italian', flag: '🇮🇹', image: '🍝' },
  { id: 'Chinese', name: 'Chinese', flag: '🇨🇳', image: '🥡' },
  { id: 'Mexican', name: 'Mexican', flag: '🇲🇽', image: '🌮' },
  { id: 'Thai', name: 'Thai', flag: '🇹🇭', image: '🍜' },
  { id: 'Japanese', name: 'Japanese', flag: '🇯🇵', image: '🍱' }
];

function Explore() {
  const [recipes, setRecipes] = useState([]);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Popular');
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(12);
  const [, setHasMore] = useState(true);
  const navigate = useNavigate();
  const featuredScrollRef = useRef(null);

  // Load featured recipes on mount
  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  // Load recipes when tab changes
  useEffect(() => {
    loadRecipes(activeTab);
    setDisplayedCount(12);
  }, [activeTab]);

  const loadFeaturedRecipes = async () => {
    setFeaturedLoading(true);
    try {
      const promises = Array(6).fill().map(() => fetchRandomMeal());
      const results = await Promise.all(promises);
      const meals = results.filter(meal => meal !== null);
      setFeaturedRecipes(meals);
    } catch (error) {
      console.error('Error loading featured recipes:', error);
    }
    setFeaturedLoading(false);
  };

  const loadRecipes = async (tab) => {
    const cacheKey = `explore_${tab}`;
    const cacheTimeKey = `explore_${tab}_time`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    const currentTime = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    // Check cache
    if (cachedData && cacheTime && (currentTime - parseInt(cacheTime)) < thirtyMinutes) {
      setRecipes(JSON.parse(cachedData));
      setHasMore(JSON.parse(cachedData).length >= 12);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let meals = [];
      
      if (tab === 'Popular') {
        meals = await fetchPopularMeals(24);
      } else if (tab === 'Random' || tab === 'Trending' || tab === 'Quick') {
        const promises = Array(24).fill().map(() => fetchRandomMeal());
        const results = await Promise.all(promises);
        meals = results.filter(meal => meal !== null);
      } else if (tab === 'Indian') {
        // Fetch Indian meals
        const response = await fetch(`${process.env.REACT_APP_MEAL_DB_BASE_URL}/filter.php?a=Indian`);
        const data = await response.json();
        meals = (data.meals || []).map(meal => ({
          ...meal,
          apiSource: 'mealdb'
        }));
      } else {
        // Fetch by category from API
        const response = await fetch(`${process.env.REACT_APP_MEAL_DB_BASE_URL}/filter.php?c=${tab}`);
        const data = await response.json();
        meals = (data.meals || []).map(meal => ({
          ...meal,
          apiSource: 'mealdb'
        }));
      }

      setRecipes(meals);
      setHasMore(meals.length > 12);
      localStorage.setItem(cacheKey, JSON.stringify(meals));
      localStorage.setItem(cacheTimeKey, currentTime.toString());
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
      setHasMore(false);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const loadMore = () => {
    setDisplayedCount(prev => prev + 12);
  };

  const scrollFeatured = (direction) => {
    if (featuredScrollRef.current) {
      const scrollAmount = 320;
      featuredScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCuisineClick = (cuisineId) => {
    navigate(`/search?cuisine=${cuisineId}`);
  };


  // Filter recipes based on active filters
  const filteredRecipes = recipes.filter(() => {
    if (activeFilters.length === 0) return true;
    // Add your filter logic here based on meal properties
    return true; // Simplified for now
  });

  const displayedRecipes = filteredRecipes.slice(0, displayedCount);

  return (
    <div className="explore-container">
      {/* Compact Hero with Search */}
      <section className="explore-hero-compact">
        <h1>Explore Recipes</h1>
        <form className="hero-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search for recipes, ingredients, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <span>🔍</span>
          </button>
        </form>
        
        {/* Quick Filter Chips */}
        <div className="quick-filters">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-chip ${activeFilters.includes(filter.id) ? 'active' : ''}`}
              onClick={() => toggleFilter(filter.id)}
            >
              <span>{filter.icon}</span>
              <span>{filter.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Today Slider */}
      <section className="featured-section">
        <div className="section-header-inline">
          <h2>Featured Today</h2>
          <div className="slider-controls">
            <button onClick={() => scrollFeatured('left')} className="scroll-btn">←</button>
            <button onClick={() => scrollFeatured('right')} className="scroll-btn">→</button>
          </div>
        </div>
        
        <div className="featured-slider" ref={featuredScrollRef}>
          {featuredLoading ? (
            Array(6).fill().map((_, index) => (
              <div key={index} className="featured-card-skeleton">
                <Skeleton type="card" />
              </div>
            ))
          ) : (
            featuredRecipes.map((meal) => (
              <Link 
                key={meal.idMeal} 
                to={`/meal/${meal.idMeal}`}
                className="featured-card"
              >
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <div className="featured-overlay">
                  <h3>{meal.strMeal}</h3>
                  <span className="featured-category">{meal.strCategory || 'Delicious'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Main Tabs */}
      <section className="main-tabs-section">
        <div className="main-tabs">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              className={`main-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
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
        ) : displayedRecipes.length > 0 ? (
          <>
            <div className="recipes-grid">
              {displayedRecipes.map((meal) => (
                <MealCard key={meal.idMeal} meal={meal} />
              ))}
            </div>
            
            {/* Load More Button */}
            {displayedCount < filteredRecipes.length && (
              <div className="load-more-section">
                <button className="load-more-btn" onClick={loadMore}>
                  Load More Recipes
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <p>No recipes found.</p>
          </div>
        )}
      </section>

      {/* Explore by Cuisine */}
      <section className="cuisine-section">
        <h2 className="section-title-large">Explore by Cuisine</h2>
        <div className="cuisine-grid">
          {cuisines.map((cuisine) => (
            <button
              key={cuisine.id}
              className="cuisine-card"
              onClick={() => handleCuisineClick(cuisine.id)}
            >
              <div className="cuisine-emoji">{cuisine.image}</div>
              <div className="cuisine-info">
                <span className="cuisine-flag">{cuisine.flag}</span>
                <span className="cuisine-name">{cuisine.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Actions Footer */}
      <section className="quick-actions">
        <Link to="/categories" className="action-card">
          <span className="action-icon">📁</span>
          <div>
            <h3>All Categories</h3>
            <p>Browse by meal type</p>
          </div>
        </Link>
        <Link to="/search" className="action-card">
          <span className="action-icon">🔍</span>
          <div>
            <h3>Advanced Search</h3>
            <p>Filter by ingredients</p>
          </div>
        </Link>
      </section>
    </div>
  );
}

export default Explore;
