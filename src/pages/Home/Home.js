import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchRandomMeal, advancedRecipeSearch, fetchCategories } from '../../services/api';
import './Home.css';

function Home() {
  const [randomMeals, setRandomMeals] = useState([]);
  const [spoonacularMeals, setSpoonacularMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spoonacularLoading, setSpoonacularLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    const loadRandomMeals = async () => {
      setLoading(true);
      try {
        // Fetch 3 random meals
        const meals = [];
        for (let i = 0; i < 3; i++) {
          const meal = await fetchRandomMeal();
          if (meal) {
            meals.push(meal);
          }
        }
        setRandomMeals(meals);
      } catch (error) {
        console.error('Error fetching random meals:', error);
      }
      setLoading(false);
    };

    const loadSpoonacularMeals = async () => {
      setSpoonacularLoading(true);
      try {
        // Get some trending recipes from Spoonacular
        const params = { 
          sort: "popularity", 
          number: 3,
          addRecipeInformation: true
        };
        const meals = await advancedRecipeSearch(params);
        
        // Check if we got valid meals back
        if (meals && meals.length > 0) {
          setSpoonacularMeals(meals);
        } else {
          console.warn("No valid meals returned from Spoonacular API");
          // Fallback to random meals if Spoonacular fails
          const fallbackMeals = [];
          for (let i = 0; i < 3; i++) {
            const meal = await fetchRandomMeal();
            if (meal) {
              fallbackMeals.push(meal);
            }
          }
          setSpoonacularMeals(fallbackMeals);
        }
      } catch (error) {
        console.error('Error fetching Spoonacular meals:', error);
        // Set empty array to prevent endless loading
        setSpoonacularMeals([]);
      } finally {
        setSpoonacularLoading(false);
      }
    };

    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const allCategories = await fetchCategories();
        // Get 6 random categories
        const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
        setCategories(shuffled.slice(0, 6));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
      setCategoryLoading(false);
    };

    loadRandomMeals();
    loadSpoonacularMeals();
    loadCategories();
  }, []);

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
          <img src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
               alt="Food hero" 
               className="hero-image" />
        </div>
      </section>

      <section className="section trending-section">
        <div className="section-header">
          <h2 className="section-title">Trending Recipes</h2>
          <p className="section-subtitle">Popular dishes people are cooking right now</p>
        </div>
        {spoonacularLoading ? (
          <div className="meal-grid">
            <Skeleton type="meal-card" count={3} />
          </div>
        ) : spoonacularMeals.length > 0 ? (
          <div className="meal-grid">
            {spoonacularMeals.map(meal => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="api-error-message">
            <p>Unable to load trending recipes at this time.</p>
          </div>
        )}
        <p className="api-attribution">Powered by Spoonacular</p>
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

      <section className="section categories-section">
        <div className="section-header">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Explore meals by category</p>
        </div>
        {categoryLoading ? (
          <div className="categories-grid">
            <Skeleton type="category-card" count={6} />
          </div>
        ) : (
          <>
            <div className="categories-grid">
              {categories.map(category => (
                <Link to={`/category/${category.strCategory}`} key={category.idCategory} className="category-card">
                  <div className="category-image-container">
                    <img src={category.strCategoryThumb} alt={category.strCategory} />
                  </div>
                  <p>{category.strCategory}</p>
                </Link>
              ))}
            </div>
            <div className="view-all-container">
              <Link to="/categories" className="view-all-link">View All Categories</Link>
            </div>
          </>
        )}
      </section>
      
      <section className="section tools-section">
        <div className="section-header">
          <h2 className="section-title">Explore Our Tools</h2>
          <p className="section-subtitle">Make your cooking experience more enjoyable</p>
        </div>
        <div className="tools-grid">
          <Link to="/ai-recipe-generator" className="tool-card">
            <div className="tool-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/>
              </svg>
            </div>
            <h3>AI Recipe Generator</h3>
            <p>Create custom recipes from ingredients you have on hand</p>
            <span className="tool-link">Try It Now <span className="arrow">→</span></span>
          </Link>
          
          <Link to="/meal-planner" className="tool-card">
            <div className="tool-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <h3>Meal Planner</h3>
            <p>Generate meal plans based on your diet and calorie needs</p>
            <span className="tool-link">Plan Your Week <span className="arrow">→</span></span>
          </Link>
          
          <Link to="/nutrition/659315" className="tool-card">
            <div className="tool-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M9,17H7v-7h2V17z M13,17h-2V7h2V17z M17,17h-2v-4h2V17z"/>
              </svg>
            </div>
            <h3>Nutrition Analysis</h3>
            <p>Get detailed nutritional information for any recipe</p>
            <span className="tool-link">Analyze Now <span className="arrow">→</span></span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
