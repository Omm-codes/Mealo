import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { searchMealsByName, fetchMealsByArea, fetchAreas, advancedRecipeSearch, fetchRandomMeal, fetchPopularMeals, searchMealsByNamePaginated, fetchMealsByCategoryPaginated } from '../../services/api';
import './Search.css';

function Search() {
  const location = useLocation();
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
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
  
  // Track if we should trigger a cuisine search after mount
  const [pendingCuisine, setPendingCuisine] = useState(null);
  
  useEffect(() => {
    // Check for selected cuisine from home page
    const storedCuisine = localStorage.getItem('selectedCuisine');
    const passedCuisine = location.state?.selectedCuisine;
    
    // If a cuisine was selected on home page, use it
    if (passedCuisine || storedCuisine) {
      const cuisineToUse = passedCuisine || storedCuisine;
      setSelectedArea(cuisineToUse);
      setCuisine(cuisineToUse); // Set cuisine for advanced search too
      setPendingCuisine(cuisineToUse);
      
      // Clear the stored cuisine after using it
      localStorage.removeItem('selectedCuisine');
    }

    const loadInitialData = async () => {
      try {
        // Check for cached areas (cuisines)
        const cachedAreas = localStorage.getItem('cachedAreas');
        const areasCacheTime = localStorage.getItem('areasCacheTime');
        const currentTime = new Date().getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours
        
        // Areas/cuisines don't change often, we can cache them for 24 hours
        const shouldRefreshAreasCache = !areasCacheTime || (currentTime - parseInt(areasCacheTime)) > oneDayInMs;
        
        if (!shouldRefreshAreasCache && cachedAreas) {
          setAreas(JSON.parse(cachedAreas));
        } else {
          const areasData = await fetchAreas();
          setAreas(areasData);
          // Cache areas data
          localStorage.setItem('cachedAreas', JSON.stringify(areasData));
          localStorage.setItem('areasCacheTime', currentTime.toString());
        }
        
        // Check for cached popular meals
        const cachedPopularMeals = localStorage.getItem('cachedPopularMeals');
        const popularMealsCacheTime = localStorage.getItem('popularMealsCacheTime');
        const oneHourInMs = 60 * 60 * 1000; // 1 hour
        
        const shouldRefreshPopularMealsCache = !popularMealsCacheTime || 
          (currentTime - parseInt(popularMealsCacheTime)) > oneHourInMs;
        
        try {
          if (!shouldRefreshPopularMealsCache && cachedPopularMeals) {
            setPopularMeals(JSON.parse(cachedPopularMeals));
          } else {
            const popularRecipes = await fetchPopularMeals(6);
            setPopularMeals(popularRecipes);
            // Cache the popular meals
            localStorage.setItem('cachedPopularMeals', JSON.stringify(popularRecipes));
            localStorage.setItem('popularMealsCacheTime', currentTime.toString());
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
  }, [location]);

  // When selectedArea changes (from Home page), trigger search for that cuisine
  useEffect(() => {
    if (pendingCuisine && selectedArea === pendingCuisine) {
      performAreaSearch(pendingCuisine);
      setPendingCuisine(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, pendingCuisine]);

  const handleBasicSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedArea) return;
    
    setLoading(true);
    setCurrentPage(0);
    try {
      let result;
      if (query.trim()) {
        result = await searchMealsByNamePaginated(query, 0, 12);
      } else if (selectedArea) {
        result = await fetchMealsByCategoryPaginated(selectedArea, 0, 12);
      }
      
      setMeals(result.meals);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setSearched(true);
    } catch (error) {
      console.error('Error searching meals:', error);
      setMeals([]);
      setHasMore(false);
      setTotalCount(0);
    }
    setLoading(false);
  };

  // Extract search logic into a separate function for reuse
  const performBasicSearch = async (searchQuery, searchArea) => {
    if (!searchQuery.trim() && !searchArea) return;

    setLoading(true);
    setCurrentPage(0);
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchMealsByNamePaginated(searchQuery, 0, 12);
        setMeals(result.meals);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        setMeals([]);
        setHasMore(false);
        setTotalCount(0);
      }
      setSearched(true);
    } catch (error) {
      console.error('Error searching meals:', error);
      setMeals([]);
      setHasMore(false);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const handleAreaChange = (area) => {
    const newSelectedArea = area === selectedArea ? '' : area;
    setSelectedArea(newSelectedArea);
    setCuisine(newSelectedArea); // Ensure advanced search cuisine stays in sync

    // Automatically trigger search when an area is selected
    if (newSelectedArea) {
      // Use fetchMealsByArea for cuisine/area search instead of fetchMealsByCategoryPaginated
      performAreaSearch(newSelectedArea);
    } else if (query.trim()) {
      performBasicSearch(query, '');
    } else {
      setMeals([]);
      setSearched(false);
      setHasMore(false);
      setTotalCount(0);
    }
  };

  // Use this for area/cuisine search (TheMealDB "area" not "category")
  const performAreaSearch = async (area) => {
    setLoading(true);
    setCurrentPage(0);
    try {
      const areaMeals = await fetchMealsByArea(area);
      setMeals(areaMeals);
      setHasMore(false);
      setTotalCount(areaMeals.length);
      setSearched(true);
    } catch (error) {
      console.error('Error searching meals by area:', error);
      setMeals([]);
      setHasMore(false);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const loadMoreMeals = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const offset = nextPage * 12;
    
    try {
      let result;
      if (query.trim()) {
        result = await searchMealsByNamePaginated(query, offset, 12);
      } else if (selectedArea) {
        result = await fetchMealsByCategoryPaginated(selectedArea, offset, 12);
      }
      
      setMeals(prev => [...prev, ...result.meals]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more meals:', error);
    }
    setLoadingMore(false);
  };
  
  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setCurrentPage(0);
    try {
      const params = {};
      
      if (query.trim()) params.query = query.trim();
      if (cuisine) params.cuisine = cuisine;
      if (diet) params.diet = diet;
      if (intolerances.length > 0) params.intolerances = intolerances.join(',');
      if (maxReadyTime > 0) params.maxReadyTime = maxReadyTime;
      
      params.number = 12;
      
      if (Object.keys(params).length <= 1) {
        params.sort = 'popularity';
      }
      
      console.log('Searching with params:', params);
      const mealsData = await advancedRecipeSearch(params);
      setMeals(mealsData);
      setHasMore(false); // Spoonacular handles its own pagination
      setTotalCount(mealsData.length);
      setSearched(true);
    } catch (error) {
      console.error('Error performing advanced search:', error);
      setMeals([]);
      setHasMore(false);
      setTotalCount(0);
    }
    setLoading(false);
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
    setCurrentPage(0);
    setHasMore(false);
    setTotalCount(0);
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
                <button 
                  type="submit" 
                  className="search-button"
                  disabled={!query.trim() && !selectedArea}
                >
                  Search
                </button>
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
            <>
              <div className="meal-grid">
                {meals.map(meal => (
                  <MealCard key={meal.idMeal} meal={meal} />
                ))}
              </div>
              
              {hasMore && (
                <div className="pagination-container">
                  <button 
                    onClick={loadMoreMeals}
                    className="load-more-button"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Recipes'}
                  </button>
                </div>
              )}
              
              {loadingMore && (
                <div className="loading-more">
                  <Skeleton type="meal-card" count={4} />
                </div>
              )}
            </>
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
