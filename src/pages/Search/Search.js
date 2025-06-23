import React, { useState, useEffect } from 'react';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { searchMealsByName, fetchMealsByArea, fetchAreas, advancedRecipeSearch, fetchRandomMeal } from '../../services/api';
import './Search.css';

function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [popularMeals, setPopularMeals] = useState([]);
  
  // Advanced search options
  const [diet, setDiet] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [intolerances, setIntolerances] = useState([]);
  const [maxReadyTime, setMaxReadyTime] = useState(60);
  
  const availableIntolerances = [
    'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 
    'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
  ];
  
  const dietOptions = [
    { value: '', label: 'Any' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Gluten Free' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' }
  ];
  
  useEffect(() => {
    // Fetch available cuisines (areas) and popular meals on initial load
    const loadInitialData = async () => {
      try {
        // Fetch areas
        const areasData = await fetchAreas();
        setAreas(areasData);
        
        // Fetch popular meals for initial display
        const params = { 
          sort: "popularity", 
          number: 6,
          addRecipeInformation: true
        };
        
        try {
          const popularRecipes = await advancedRecipeSearch(params);
          if (popularRecipes && popularRecipes.length > 0) {
            setPopularMeals(popularRecipes);
          } else {
            console.warn("No popular recipes returned from API");
            // Fallback to random meals
            const randomMeals = [];
            for (let i = 0; i < 6; i++) {
              const meal = await fetchRandomMeal();
              if (meal) randomMeals.push(meal);
              if (randomMeals.length >= 6) break;
            }
            setPopularMeals(randomMeals);
          }
        } catch (popularError) {
          console.error('Error fetching popular meals:', popularError);
          setPopularMeals([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleBasicSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() && !selectedArea) return;
    
    setLoading(true);
    try {
      let mealsData;
      if (query.trim()) {
        mealsData = await searchMealsByName(query);
      } else if (selectedArea) {
        mealsData = await fetchMealsByArea(selectedArea);
      }
      
      setMeals(mealsData);
      setSearched(true);
    } catch (error) {
      console.error('Error searching meals:', error);
      setMeals([]);
    }
    setLoading(false);
  };
  
  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Create params object only including non-empty values
      const params = {};
      
      // Only add parameters that have values
      if (query.trim()) params.query = query.trim();
      if (cuisine) params.cuisine = cuisine;
      if (diet) params.diet = diet;
      if (intolerances.length > 0) params.intolerances = intolerances.join(',');
      if (maxReadyTime > 0) params.maxReadyTime = maxReadyTime;
      
      // Always set a number of results
      params.number = 12;
      
      // If no search parameters are provided, search for random popular recipes
      if (Object.keys(params).length <= 1) {
        params.sort = 'popularity';
      }
      
      console.log('Searching with params:', params);
      const mealsData = await advancedRecipeSearch(params);
      setMeals(mealsData);
      setSearched(true);
    } catch (error) {
      console.error('Error performing advanced search:', error);
      setMeals([]);
    }
    setLoading(false);
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area === selectedArea ? '' : area);
  };
  
  const handleIntoleranceChange = (intolerance) => {
    setIntolerances(prev => 
      prev.includes(intolerance)
        ? prev.filter(i => i !== intolerance)
        : [...prev, intolerance]
    );
  };

  const toggleAreaDisplay = () => {
    setShowAllAreas(!showAllAreas);
  };
  
  const displayedAreas = showAllAreas ? areas : areas.slice(0, 8);
  
  const resetFilters = () => {
    setQuery('');
    setSelectedArea('');
    setDiet('');
    setCuisine('');
    setIntolerances([]);
    setMaxReadyTime(60);
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <h2 className="page-title">Find Your Perfect Recipe</h2>
        <p className="search-subtitle">
          Search from thousands of recipes or filter by cuisine, diet, and more
        </p>
      </div>
      
      <div className="search-container">
        <div className="search-tabs">
          <button 
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <span className="tab-icon"></span> Basic Search
          </button>
          <button 
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <span className="tab-icon"></span> Advanced Search
          </button>
        </div>
        
        <div className="search-panel">
          {activeTab === 'basic' ? (
            <>
              <form onSubmit={handleBasicSearch} className="search-form">
                <div className="search-input-container">
                  <span className="search-icon"></span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search for a meal or ingredient..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  {(query || selectedArea) && (
                    <button 
                      type="button" 
                      className="clear-search" 
                      onClick={resetFilters}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button type="submit" className="search-button">Search</button>
              </form>

              <div className="search-options">
                <h3 className="filters-title">Filter by cuisine:</h3>
                <div className="search-filters">
                  {displayedAreas.map((area, index) => (
                    <button
                      key={index}
                      className={`filter-button ${selectedArea === area.strArea ? 'active' : ''}`}
                      onClick={() => handleAreaChange(area.strArea)}
                    >
                      {area.strArea}
                    </button>
                  ))}
                  {areas.length > 8 && (
                    <button 
                      className="show-more-button"
                      onClick={toggleAreaDisplay}
                    >
                      {showAllAreas ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleAdvancedSearch} className="advanced-search-form">
              <div className="form-row">
                <div className="form-group search-term-group">
                  <label htmlFor="query">
                    Recipe Name or Ingredients
                  </label>
                  <input
                    type="text"
                    id="query"
                    placeholder="e.g., pasta, chicken parmesan, etc."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="diet">
                    Diet
                  </label>
                  <select 
                    id="diet" 
                    value={diet} 
                    onChange={e => setDiet(e.target.value)}
                  >
                    {dietOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="cuisine">
                    Cuisine
                  </label>
                  <select 
                    id="cuisine" 
                    value={cuisine} 
                    onChange={e => setCuisine(e.target.value)}
                  >
                    <option value="">Any Cuisine</option>
                    {areas.map((area, index) => (
                      <option key={index} value={area.strArea}>
                        {area.strArea}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxReadyTime">
                    Max Time (minutes)
                  </label>
                  <div className="range-input-container">
                    <input
                      type="range"
                      id="maxReadyTime"
                      min="10"
                      max="240"
                      step="5"
                      value={maxReadyTime}
                      onChange={e => setMaxReadyTime(e.target.value)}
                    />
                    <span className="range-value">{maxReadyTime} min</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  Exclude Intolerances
                </label>
                <div className="intolerances-container">
                  {availableIntolerances.map(intolerance => (
                    <label key={intolerance} className="intolerance-checkbox">
                      <input
                        type="checkbox"
                        checked={intolerances.includes(intolerance)}
                        onChange={() => handleIntoleranceChange(intolerance)}
                      />
                      <span className="checkbox-text">{intolerance}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="reset-button" onClick={resetFilters}>
                  Reset Filters
                </button>
                <button type="submit" className="search-button full-width">
                  Search Recipes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {loading ? (
        <div className="search-results loading">
          <div className="loading-message">
            <div className="loading-icon">🍳</div>
            <p>Searching for delicious recipes...</p>
          </div>
          <div className="meal-grid">
            <Skeleton type="meal-card" count={6} />
          </div>
        </div>
      ) : (
        <div className="search-results">
          {!loading && searched && (
            <div className="results-header">
              {meals.length === 0 ? (
                <h3>No recipes found</h3>
              ) : (
                <h3>Found {meals.length} recipe{meals.length !== 1 ? 's' : ''}</h3>
              )}
            </div>
          )}
          
          {!loading && searched && meals.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🤔</div>
              <h3>No recipes found</h3>
              <p>Try different search terms or filters to find more recipes</p>
              <button onClick={resetFilters} className="try-again-button">
                Reset Search
              </button>
            </div>
          ) : searched ? (
            <div className="meal-grid">
              {meals.map(meal => (
                <MealCard key={meal.idMeal} meal={meal} />
              ))}
            </div>
          ) : (
            <div className="popular-recipes-section">
              <h3 className="popular-recipes-title">Popular Recipes</h3>
              <p className="popular-recipes-subtitle">Explore these trending recipes or search for something specific</p>
              
              {initialLoading ? (
                <div className="meal-grid">
                  <Skeleton type="meal-card" count={6} />
                </div>
              ) : popularMeals.length > 0 ? (
                <div className="meal-grid">
                  {popularMeals.map(meal => (
                    <MealCard key={meal.idMeal} meal={meal} />
                  ))}
                </div>
              ) : (
                <div className="no-popular-recipes">
                  <p>Unable to load popular recipes. Try searching for a specific recipe instead.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="api-attribution search-api-attribution">
        <p>Basic search powered by TheMealDB API. Advanced search powered by Spoonacular API.</p>
      </div>
    </div>
  );
}

export default Search;

