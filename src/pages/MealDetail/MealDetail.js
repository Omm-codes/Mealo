import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import PrintButton from '../../components/PrintButton/PrintButton';
import Skeleton from '../../components/Skeleton/Skeleton';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { fetchMealById, fetchMealsByCategory, hasNutritionData } from '../../services/api';

import './MealDetail.css';

function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedMeals, setRelatedMeals] = useState([]);
  const [activeTab, setActiveTab] = useState('ingredients');
  
  useEffect(() => {
    const loadMealDetails = async () => {
      try {
        const mealData = await fetchMealById(id);
        if (mealData) {
          setMeal(mealData);
          // Fetch related meals by category
          if (mealData.strCategory) {
            const categoryMeals = await fetchMealsByCategory(mealData.strCategory);
            // Filter out current meal and take 3 random meals
            const filtered = categoryMeals.filter(m => {
              // Always compare as string
              const relatedId = m.idMeal ? m.idMeal.toString() : (m.id ? m.id.toString() : '');
              return relatedId !== mealData.idMeal.toString();
            });
            const randomRelated = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
            setRelatedMeals(randomRelated);
          }
        }
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
      setLoading(false);
    };

    loadMealDetails();
    // Scroll to top when component mounts or ID changes
    window.scrollTo(0, 0);
  }, [id]);

  // Extract ingredients and measurements
  const getIngredients = (meal) => {
    const ingredients = [];
    // For Spoonacular data, ingredients might be in extendedIngredients array
    if (meal.extendedIngredients && Array.isArray(meal.extendedIngredients)) {
      meal.extendedIngredients.forEach(ing => {
        ingredients.push({
          name: ing.name,
          measure: `${ing.amount} ${ing.unit}`
        });
      });
    } else {
      // Fallback to traditional ingredient extraction (for TheMealDB)
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient,
            measure: measure || ''
          });
        }
      }
    }
    return ingredients;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderIngredients = () => {
    return (
      <div className="ingredients-section">
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          {ingredients.map((ing, index) => (
            <li key={index} className="ingredient-item">
              <span className="ingredient-measure">{ing.measure}</span>
              <span className="ingredient-name">{ing.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const renderInstructions = () => {
    // Use strInstructions (TheMealDB) or instructions (Spoonacular)
    const instructionsText = meal.strInstructions || meal.instructions || '';
    // Split by line breaks or periods for Spoonacular
    let paragraphs = [];
    if (instructionsText.includes('\r\n')) {
      paragraphs = instructionsText.split('\r\n').filter(para => para.trim());
    } else if (instructionsText.includes('\n')) {
      paragraphs = instructionsText.split('\n').filter(para => para.trim());
    } else if (instructionsText.includes('. ')) {
      paragraphs = instructionsText.split('. ').map(s => s.trim()).filter(s => s).map(s => s.endsWith('.') ? s : s + '.');
    } else {
      paragraphs = [instructionsText];
    }
    return (
      <div className="instructions-section">
        <h3>Preparation Steps</h3>
        <div className="meal-instructions">
          {paragraphs.map((para, idx) => <p key={idx}>{para}</p>)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="skeleton-meal-detail">
        <div className="skeleton-meal-header">
          <div className="skeleton-meal-title"></div>
          <div className="skeleton-meal-meta">
            <div className="skeleton-meal-tag"></div>
            <div className="skeleton-meal-tag"></div>
          </div>
        </div>
        <div className="skeleton-image-container"></div>
        <div className="skeleton-content">
          <div className="skeleton-ingredients">
            <div className="skeleton-section-title"></div>
            <Skeleton type="ingredient" count={8} />
          </div>
          <div>
            <div className="skeleton-section-title"></div>
            <Skeleton type="text-line" count={10} />
          </div>
        </div>
      </div>
    );
  }
  
  if (!meal) return <div className="error-message">Recipe not found</div>;

  const ingredients = getIngredients(meal);
  
  // Check for source URL (Spoonacular) or YouTube URL (TheMealDB)
  const hasVideo = meal.strYoutube && meal.strYoutube.includes('youtube.com');
  const hasSourceUrl = meal.sourceUrl || (meal.strYoutube && !meal.strYoutube.includes('youtube.com'));
  
  // Extract video ID if it's a YouTube URL
  let videoId = null;
  let cleanVideoId = null;
  
  if (hasVideo) {
    videoId = meal.strYoutube.split('v=')[1];
    cleanVideoId = videoId ? videoId.split('&')[0] : null;
  }

  // Calculate approximate cooking time based on ingredients and complexity
  const estimateCookingTime = () => {
    if (meal.readyInMinutes) return meal.readyInMinutes;
    
    // Use correct instructions text
    const instructionsText = meal.strInstructions || meal.instructions || '';
    const baseTime = 15;
    const ingredientsTime = ingredients.length * 2;
    const instructionsTime = Math.ceil(instructionsText.length / 500) * 5;
    return baseTime + ingredientsTime + instructionsTime;
  };
  
  // Determine difficulty based on ingredients and instructions
  const determineDifficulty = () => {
    const instructionsText = meal.strInstructions || meal.instructions || '';
    if (ingredients.length > 12 || instructionsText.length > 1500) return 'Advanced';
    if (ingredients.length > 7 || instructionsText.length > 800) return 'Intermediate';
    return 'Easy';
  };

  const cookingTime = estimateCookingTime();

  return (
    <div className="meal-detail">
      <button onClick={handleGoBack} className="back-button">
        ← Back
      </button>
      
      <div className="meal-header">
        <div className="meal-title-section">
          <h2>{meal.strMeal}</h2>
          <div className="meal-meta-tags">
            {meal.strCategory && <span className="meal-tag category-tag">{meal.strCategory}</span>}
            {meal.strArea && <span className="meal-tag area-tag">{meal.strArea}</span>}
            {meal.strTags && meal.strTags.split(',').map((tag, index) => (
              <span key={index} className="meal-tag">{tag.trim()}</span>
            ))}
          </div>
        </div>
        <div className="meal-actions">
          <PrintButton meal={meal} />
          <FavoriteButton mealId={meal.idMeal} />
          {hasNutritionData(meal) && (
            <Link to={`/nutrition/${meal.idMeal}`} className="nutrition-button">
              <span className="nutrition-icon">📊</span>
              <span className="nutrition-text">Nutrition Facts</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="meal-overview">
        <div className="meal-image-container">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="meal-image" />
          <div className="meal-stats">
            <div className="meal-stat">
              <span className="stat-icon">⏱️</span>
              <span className="stat-label">Time</span>
              <span className="stat-value">{cookingTime} min</span>
            </div>
            <div className="meal-stat">
              <span className="stat-icon">📝</span>
              <span className="stat-label">Difficulty</span>
              <span className="stat-value">{determineDifficulty()}</span>
            </div>
            <div className="meal-stat">
              <span className="stat-icon">🍽️</span>
              <span className="stat-label">Ingredients</span>
              <span className="stat-value">{ingredients.length}</span>
            </div>
          </div>
        </div>
        
        <div className="meal-content-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`} 
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button 
              className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`} 
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'ingredients' ? renderIngredients() : renderInstructions()}
          </div>
        </div>
      </div>
      
      {cleanVideoId && (
        <div className="video-section">
          <h3>Video Tutorial</h3>
          <div className="video-container">
            <iframe
              title="Recipe Video Tutorial"
              src={`https://www.youtube.com/embed/${cleanVideoId}?rel=0&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              playsInline
            ></iframe>
          </div>
        </div>
      )}
      
      {hasSourceUrl && !hasVideo && (
        <div className="source-section">
          <h3>Source</h3>
          <a 
            href={meal.sourceUrl || meal.strYoutube} 
            target="_blank" 
            rel="noreferrer"
            className="source-link"
          >
            View Original Recipe
          </a>
        </div>
      )}
      
      {relatedMeals.length > 0 && (
        <div className="related-meals">
          <h3>Similar Recipes</h3>
          <div className="related-meals-grid">
            {relatedMeals.map(relatedMeal => (
              <Link 
                key={relatedMeal.idMeal} 
                to={`/meal/${relatedMeal.idMeal}`}
                className="related-meal-card"
              >
                <div className="related-meal-img">
                  <img src={relatedMeal.strMealThumb} alt={relatedMeal.strMeal} />
                </div>
                <h4>{relatedMeal.strMeal}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default MealDetail;

