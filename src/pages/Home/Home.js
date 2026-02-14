import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchPopularMeals } from '../../services/api';
import './Home.css';

function Home() {
  const [randomMeals, setRandomMeals] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisineLoading, setCuisineLoading] = useState(true);
  const [activeCuisineTab, setActiveCuisineTab] = useState('Popular');
  const [activeView, setActiveView] = useState('cuisines'); // 'cuisines' or 'meals'

  useEffect(() => {
    // Check if cached data exists and is not older than 30 minutes
    const cachedRandomMeals = localStorage.getItem('cachedRandomMeals');
    const cacheTime = localStorage.getItem('homePageCacheTime');
    const currentTime = new Date().getTime();
    const thirtyMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    const shouldRefreshCache = !cacheTime || (currentTime - parseInt(cacheTime)) > thirtyMinutes;

    const loadRandomMeals = async () => {
      if (!shouldRefreshCache && cachedRandomMeals) {
        try {
          setRandomMeals(JSON.parse(cachedRandomMeals));
          setLoading(false);
          return;
        } catch (parseError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to parse cached random meals:', parseError);
          }
          // Continue to fetch fresh data below
        }
      }

      setLoading(true);
      try {
        const meals = await fetchPopularMeals(3);
        setRandomMeals(meals);
        // Cache the results
        localStorage.setItem('cachedRandomMeals', JSON.stringify(meals));
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching random meals:', error);
        }
      }
      setLoading(false);
    };

    const loadCuisines = async () => {
      // Cuisines don't change often, we can load them from the predefined array
      setCuisineLoading(true);
      
      // Define our required cuisines
      const requiredCuisines = [
        'American', 'Thai', 'Italian', 'French', 
        'Spanish', 'Turkish', 'Chinese', 'Indian'
      ];
      
      // Create cuisine objects directly
      const displayCuisines = requiredCuisines.map(name => ({ strArea: name }));
      
      setCuisines(displayCuisines);
      setCuisineLoading(false);
    };

    // Load content
    loadRandomMeals();
    loadCuisines();
    
    // Update cache timestamp
    if (shouldRefreshCache) {
      localStorage.setItem('homePageCacheTime', currentTime.toString());
    }
  }, []);

  // Cuisine background images and descriptions
  const cuisineDetails = {
    'Italian': {
      image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=500&h=300&fit=crop',
      description: 'Pasta, pizza, and Mediterranean flavors',
      recipeCount: '250+ recipes',
      spiceLevel: 'Mild',
      cookTime: '30-45 min',
      category: 'European'
    },
    'Mexican': {
      image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=500&h=300&fit=crop',
      description: 'Bold spices, corn, and vibrant ingredients',
      recipeCount: '180+ recipes',
      spiceLevel: 'Medium-Hot',
      cookTime: '25-40 min',
      category: 'Popular'
    },
    'Indian': {
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop',
      description: 'Rich curries, aromatic spices, and vibrant flavors',
      recipeCount: '320+ recipes',
      spiceLevel: 'Medium-Hot',
      cookTime: '35-50 min',
      category: 'Indian',
      featured: true
    },
    'Chinese': {
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&h=300&fit=crop',
      description: 'Stir-fries, dumplings, and balanced flavors',
      recipeCount: '200+ recipes',
      spiceLevel: 'Mild-Medium',
      cookTime: '20-35 min',
      category: 'Asian'
    },
    'Japanese': {
      image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=500&h=300&fit=crop',
      description: 'Sushi, ramen, and precise techniques',
      recipeCount: '150+ recipes',
      spiceLevel: 'Mild',
      cookTime: '25-40 min',
      category: 'Asian'
    },
    'Thai': {
      image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&h=300&fit=crop',
      description: 'Sweet, sour, and spicy harmony',
      recipeCount: '170+ recipes',
      spiceLevel: 'Medium-Hot',
      cookTime: '25-35 min',
      category: 'Asian'
    },
    'French': {
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
      description: 'Elegant cooking with rich sauces',
      recipeCount: '140+ recipes',
      spiceLevel: 'Mild',
      cookTime: '40-60 min',
      category: 'European'
    },
    'Spanish': {
      image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=500&h=300&fit=crop',
      description: 'Paella, tapas, and fresh ingredients',
      recipeCount: '130+ recipes',
      spiceLevel: 'Mild',
      cookTime: '30-45 min',
      category: 'European'
    },
    'Turkish': {
      image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&h=300&fit=crop',
      description: 'Kebabs, mezze, and rich traditions',
      recipeCount: '110+ recipes',
      spiceLevel: 'Mild-Medium',
      cookTime: '30-45 min',
      category: 'European'
    },
    'Greek': {
      image: 'https://images.unsplash.com/photo-1558005530-a7958896ec60?w=500&h=300&fit=crop',
      description: 'Olives, feta, and Mediterranean herbs',
      recipeCount: '120+ recipes',
      spiceLevel: 'Mild',
      cookTime: '25-40 min',
      category: 'European'
    },
    'American': {
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&h=300&fit=crop',
      description: 'Burgers, comfort food, and diversity',
      recipeCount: '280+ recipes',
      spiceLevel: 'Mild',
      cookTime: '20-35 min',
      category: 'Popular'
    },
    'British': {
      image: 'https://images.unsplash.com/photo-1611973617655-38161a7644fc?w=500&h=300&fit=crop',
      description: 'Hearty classics and traditional dishes',
      recipeCount: '90+ recipes',
      spiceLevel: 'Mild',
      cookTime: '35-50 min',
      category: 'European'
    },
  };
  
  // Get cuisine details or use defaults
  const getCuisineDetails = (cuisine) => {
    return cuisineDetails[cuisine] || {
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=500&h=300&fit=crop',
      description: 'Explore traditional dishes and flavors',
      recipeCount: '50+ recipes',
      spiceLevel: 'Mild',
      cookTime: '30-45 min',
      category: 'Popular'
    };
  };

  // Filter cuisines by category
  const getFilteredCuisines = () => {
    if (activeCuisineTab === 'Popular') {
      return cuisines.filter(c => ['American', 'Mexican', 'Italian', 'Indian'].includes(c.strArea));
    }
    if (activeCuisineTab === 'Indian') {
      return cuisines.filter(c => c.strArea === 'Indian');
    }
    return cuisines.filter(c => {
      const details = getCuisineDetails(c.strArea);
      return details.category === activeCuisineTab;
    });
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover <span className="accent-text">Delicious</span> Recipes</h1>
          <p>Find, save, and explore amazing meals from around the world</p>
          <div className="hero-buttons">
            <Link to="/search" className="btn primary-btn">Find Recipes</Link>
            <Link to="/categories" className="btn secondary-btn">Browse Categories</Link>
          </div>
        </div>
        <div className="hero-image-container">
          <img 
            src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Food hero" 
            className="hero-image"
            loading="eager" // Add eager loading for the hero image
          />
        </div>
      </section>

      <section className="section cuisines-section merged-discovery-section">
        <div className="section-header">
          <h2 className="section-title">Discover Your Next Meal</h2>
          <p className="section-subtitle">Explore by cuisine or browse our featured dishes</p>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="view-toggle">
          <button 
            className={`view-toggle-btn ${activeView === 'cuisines' ? 'active' : ''}`}
            onClick={() => setActiveView('cuisines')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            Browse by Cuisine
          </button>
          <button 
            className={`view-toggle-btn ${activeView === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveView('meals')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Featured Dishes
          </button>
        </div>
        
        {/* Cuisines View */}
        {activeView === 'cuisines' && (
          <>
            <div className="cuisine-tabs">
              <button 
                className={`cuisine-tab ${activeCuisineTab === 'Popular' ? 'active' : ''}`}
                onClick={() => setActiveCuisineTab('Popular')}
              >
                Popular
              </button>
              <button 
                className={`cuisine-tab ${activeCuisineTab === 'Indian' ? 'active' : ''}`}
                onClick={() => setActiveCuisineTab('Indian')}
              >
                Indian
              </button>
              <button 
                className={`cuisine-tab ${activeCuisineTab === 'Asian' ? 'active' : ''}`}
                onClick={() => setActiveCuisineTab('Asian')}
              >
                Asian
              </button>
              <button 
                className={`cuisine-tab ${activeCuisineTab === 'European' ? 'active' : ''}`}
                onClick={() => setActiveCuisineTab('European')}
              >
                European
              </button>
            </div>
            
            {cuisineLoading ? (
              <div className="cuisines-grid">
                <Skeleton type="cuisine-card" count={window.innerWidth <= 480 ? 3 : 6} />
              </div>
            ) : (
              <>
                <div className="cuisines-grid">
                  {getFilteredCuisines().map((cuisine, index) => {
                    const cuisineDetails = getCuisineDetails(cuisine.strArea);
                    const isIndian = cuisine.strArea === 'Indian';
                    return (
                      <Link 
                        to="/search" 
                        state={{ selectedCuisine: cuisine.strArea }}
                        onClick={() => {
                          localStorage.setItem('selectedCuisine', cuisine.strArea);
                        }} 
                        key={index} 
                        className={`cuisine-card ${isIndian ? 'featured-cuisine' : ''}`}
                        aria-label={`Browse ${cuisine.strArea} recipes`}
                      >
                        <div className="cuisine-image">
                          <img 
                            src={cuisineDetails.image} 
                            alt={`${cuisine.strArea} cuisine`}
                            loading="lazy"
                          />
                          <div className="cuisine-overlay">
                            <div className="cuisine-hover-cta">
                              <span className="cta-icon">→</span>
                              <span className="cta-text">Explore Recipes</span>
                            </div>
                          </div>
                          {isIndian && <div className="featured-badge">Popular Choice</div>}
                        </div>
                        <div className="cuisine-content">
                          <h3 className="cuisine-name">{cuisine.strArea}</h3>
                          <div className="cuisine-meta">
                            <span className="meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              {cuisineDetails.recipeCount}
                            </span>
                            <span className="meta-item spice-level">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                              {cuisineDetails.spiceLevel}
                            </span>
                            <span className="meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                              </svg>
                              {cuisineDetails.cookTime}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                <div className="view-all-container">
                  <Link to="/search" className="view-all-link">
                    View All Cuisines
                  </Link>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Featured Meals View */}
        {activeView === 'meals' && (
          <>
            {loading ? (
              <div className="meal-grid featured-meals-grid">
                <Skeleton type="meal-card" count={6} />
              </div>
            ) : (
              <>
                <div className="meal-grid featured-meals-grid">
                  {randomMeals.map(meal => (
                    <MealCard key={meal.idMeal ? meal.idMeal.toString() : meal.id.toString()} meal={meal} />
                  ))}
                </div>
                <div className="view-all-container">
                  <Link to="/explore" className="view-all-link">
                    Explore More Dishes
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </section>
      
      <section className="section tools-section">
        <div className="section-header">
          <h2 className="section-title">Power Up Your Cooking</h2>
          <p className="section-subtitle">Unlock smart tools to plan, create, and perfect your meals</p>
        </div>
        <div className="tools-grid">
          <Link to="/ai-recipe-generator" className="tool-card ai-tool" aria-label="AI Recipe Generator Tool">
            <div className="tool-card-bg"></div>
            <div className="tool-content">
              <div className="tool-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/>
                </svg>
              </div>
              <h3>AI Recipe Generator</h3>
              <p>Create custom recipes from ingredients you have on hand</p>
              <span className="tool-link">Try It Now <span className="arrow" aria-hidden="true">→</span></span>
            </div>
          </Link>
          
          <Link to="/meal-planner" className="tool-card planner-tool" aria-label="Meal Planner Tool">
            <div className="tool-card-bg"></div>
            <div className="tool-content">
              <div className="tool-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
              </div>
              <h3>Meal Planner</h3>
              <p>Generate meal plans based on your diet and calorie needs</p>
              <span className="tool-link">Plan Your Week <span className="arrow">→</span></span>
            </div>
          </Link>
          
          <Link to="/nutrition/716429" className="tool-card nutrition-tool" aria-label="Nutrition Analysis Tool">
            <div className="tool-card-bg"></div>
            <div className="tool-content">
              <div className="tool-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M9,17H7v-7h2V17z M13,17h-2V7h2V17z M17,17h-2v-4h2V17z"/>
                </svg>
              </div>
              <h3>Nutrition Analysis</h3>
              <p>Get detailed nutritional information for any recipe</p>
              <span className="tool-link">Analyze Now <span className="arrow">→</span></span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;