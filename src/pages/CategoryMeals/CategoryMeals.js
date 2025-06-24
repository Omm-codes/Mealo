import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchMealsByCategoryPaginated } from '../../services/api';
import './CategoryMeals.css';

function CategoryMeals() {
  const { name } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  useEffect(() => {
    const loadCategoryMeals = async () => {
      setLoading(true);
      setCurrentPage(0);
      try {
        const result = await fetchMealsByCategoryPaginated(name, 0, 12);
        setMeals(result.meals);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching category meals:', error);
        setMeals([]);
        setHasMore(false);
      }
      setLoading(false);
    };

    loadCategoryMeals();
    // Scroll to top when category changes
    window.scrollTo(0, 0);
  }, [name]);

  const loadMoreMeals = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const offset = nextPage * 12;
    
    try {
      const result = await fetchMealsByCategoryPaginated(name, offset, 12);
      setMeals(prev => [...prev, ...result.meals]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more meals:', error);
    }
    setLoadingMore(false);
  };

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
        <>
          <div className="meal-grid">
            {meals.map(meal => (
              <MealCard key={meal.idMeal ? meal.idMeal.toString() : meal.id.toString()} meal={meal} />
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
        <div className="no-meals-found">
          <h3>No meals found in this category</h3>
          <p>Please try another category</p>
        </div>
      )}
    </div>
  );
}

export default CategoryMeals;