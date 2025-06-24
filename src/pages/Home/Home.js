import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchRandomMeal, advancedRecipeSearch, fetchAreas, fetchPopularMeals } from '../../services/api';
import './Home.css';

function Home() {
  const [randomMeals, setRandomMeals] = useState([]);
  const [trendingMeals, setTrendingMeals] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [cuisineLoading, setCuisineLoading] = useState(true);

  useEffect(() => {
    // Check if cached data exists and is not older than 30 minutes
    const cachedRandomMeals = localStorage.getItem('cachedRandomMeals');
    const cachedTrendingMeals = localStorage.getItem('cachedTrendingMeals');
    const cacheTime = localStorage.getItem('homePageCacheTime');
    const currentTime = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const shouldRefreshCache = !cacheTime || (currentTime - parseInt(cacheTime)) > thirtyMinutes;

    const loadRandomMeals = async () => {
      if (!shouldRefreshCache && cachedRandomMeals) {
        setRandomMeals(JSON.parse(cachedRandomMeals));
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const meals = await fetchPopularMeals(3);
        setRandomMeals(meals);
        // Cache the results
        localStorage.setItem('cachedRandomMeals', JSON.stringify(meals));
      } catch (error) {
        console.error('Error fetching random meals:', error);
      }
      setLoading(false);
    };

    const loadTrendingMeals = async () => {
      if (!shouldRefreshCache && cachedTrendingMeals) {
        setTrendingMeals(JSON.parse(cachedTrendingMeals));
        setTrendingLoading(false);
        return;
      }
      
      setTrendingLoading(true);
      try {
        const meals = await fetchPopularMeals(3);
        setTrendingMeals(meals);
        // Cache the results
        localStorage.setItem('cachedTrendingMeals', JSON.stringify(meals));
      } catch (error) {
        console.error('Error fetching trending meals:', error);
        setTrendingMeals([]);
      }
      setTrendingLoading(false);
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
    loadTrendingMeals();
    loadCuisines();
    
    // Update cache timestamp
    if (shouldRefreshCache) {
      localStorage.setItem('homePageCacheTime', currentTime.toString());
    }
  }, []);

  // Cuisine background images and descriptions
  const cuisineDetails = {
    'Italian': {
      image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Pasta, pizza, and Mediterranean flavors'
    },
    'Mexican': {
      image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Bold spices, corn, and vibrant ingredients'
    },
    'Indian': {
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Curry, spices, and aromatic dishes'
    },
    'Chinese': {
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Stir-fries, dumplings, and balanced flavors'
    },
    'Japanese': {
      image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Sushi, ramen, and precise techniques'
    },
    'Thai': {
      image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Sweet, sour, and spicy harmony'
    },
    'French': {
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Elegant cooking with rich sauces'
    },
    'Spanish': {
      image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Paella, tapas, and fresh ingredients'
    },
    'Greek': {
      image: 'https://images.unsplash.com/photo-1558005530-a7958896ec60?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Olives, feta, and Mediterranean herbs'
    },
    'American': {
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Burgers, comfort food, and diversity'
    },
    'British': {
      image: 'https://images.unsplash.com/photo-1611973617655-38161a7644fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Hearty classics and traditional dishes'
    },
  };
  
  // Get cuisine details or use defaults
  const getCuisineDetails = (cuisine) => {
    return cuisineDetails[cuisine] || {
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Explore traditional dishes and flavors'
    };
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

      <section className="section cuisines-section">
        <div className="section-header">
          <h2 className="section-title">Explore World Cuisines</h2>
          <p className="section-subtitle">Discover amazing dishes from around the globe</p>
        </div>
        
        {cuisineLoading ? (
          <div className="cuisines-grid">
            <Skeleton type="cuisine-card" count={window.innerWidth <= 480 ? 3 : 6} />
          </div>
        ) : (
          <>
            <div className="cuisines-grid">
              {cuisines.map((cuisine, index) => {
                const cuisineDetails = getCuisineDetails(cuisine.strArea);
                return (
                  <Link 
                    to="/search" 
                    state={{ selectedCuisine: cuisine.strArea }}
                    onClick={() => {
                      localStorage.setItem('selectedCuisine', cuisine.strArea);
                    }} 
                    key={index} 
                    className="cuisine-card"
                    aria-label={`Browse ${cuisine.strArea} recipes`}
                  >
                    <div 
                      className="cuisine-image" 
                      style={{
                        backgroundImage: `url(${cuisineDetails.image})`
                      }}
                    >
                      <div className="cuisine-overlay">
                        <div className="cuisine-icon">
                          {getCuisineEmoji(cuisine.strArea)}
                        </div>
                      </div>
                    </div>
                    <div className="cuisine-content">
                      <h3 className="cuisine-name">{cuisine.strArea}</h3>
                      <p className="cuisine-description">{cuisineDetails.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="view-all-container">
              <Link to="/search" className="view-all-link">
                Explore All Cuisines
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="section featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Meals</h2>
          <p className="section-subtitle">Discover something new and exciting today</p>
        </div>
        {loading ? (
          <div className="meal-grid">
            <Skeleton type="meal-card" count={3} />
          </div>
        ) : (
          <div className="meal-grid">
            {randomMeals.map(meal => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        )}
      </section>
      
      <section className="section tools-section">
        <div className="section-header">
          <h2 className="section-title">Explore Our Tools</h2>
          <p className="section-subtitle">Make your cooking experience more enjoyable</p>
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

// Helper function to get an appropriate emoji for each cuisine
const getCuisineEmoji = (cuisine) => {
  const emojiMap = {
    'American': '🇺🇸',
    'British': '🇬🇧',
    'Canadian': '🇨🇦',
    'Chinese': '🇨🇳',
    'Dutch': '🇳🇱',
    'Egyptian': '🇪🇬',
    'French': '🇫🇷',
    'Greek': '🇬🇷',
    'Indian': '🇮🇳',
    'Irish': '🇮🇪',
    'Italian': '🇮🇹',
    'Jamaican': '🇯🇲',
    'Japanese': '🇯🇵',
    'Kenyan': '🇰🇪',
    'Malaysian': '🇲🇾',
    'Mexican': '🇲🇽',
    'Moroccan': '🇲🇦',
    'Polish': '🇵🇱',
    'Portuguese': '🇵🇹',
    'Russian': '🇷🇺',
    'Spanish': '🇪🇸',
    'Thai': '🇹🇭',
    'Tunisian': '🇹🇳',
    'Turkish': '🇹🇷',
    'Vietnamese': '🇻🇳'
  };

  return emojiMap[cuisine] || '🌍';
};



export default Home;
