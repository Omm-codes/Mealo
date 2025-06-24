import React, { useState, useEffect } from 'react';
import { getMealPlanByDiet, fetchRandomMeal } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import { Link } from 'react-router-dom';
import './MealPlanner.css';

function MealPlanner() {
  const [diet, setDiet] = useState('');
  const [calories, setCalories] = useState('2000');
  const [timeFrame, setTimeFrame] = useState('day');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRecentPlan, setHasRecentPlan] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [inspirationMeal, setInspirationMeal] = useState(null);

  const dietOptions = [
    { value: '', label: 'No restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Gluten Free' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'whole30', label: 'Whole30' },
    { value: 'pescetarian', label: 'Pescetarian' },
    { value: 'mediterranean', label: 'Mediterranean' }
  ];

  useEffect(() => {
    // Check for recent plan in localStorage
    const recentPlan = localStorage.getItem('recentMealPlan');
    if (recentPlan) {
      setHasRecentPlan(true);
    }
    
    // Load saved plans from localStorage
    const savedPlansData = localStorage.getItem('savedMealPlans');
    if (savedPlansData) {
      setSavedPlans(JSON.parse(savedPlansData));
    }
    
    // Fetch a random meal for inspiration
    const loadInspirationMeal = async () => {
      try {
        const meal = await fetchRandomMeal();
        setInspirationMeal(meal);
      } catch (err) {
        console.error('Failed to load inspiration meal', err);
      }
    };
    
    loadInspirationMeal();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (calories < 800 || calories > 4000) {
      setError('Please enter a calorie target between 800 and 4000');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const mealPlanData = await getMealPlanByDiet(diet, calories, timeFrame);
      setMealPlan(mealPlanData);
      
      // Store in localStorage for retrieval later
      localStorage.setItem('recentMealPlan', JSON.stringify({
        plan: mealPlanData,
        diet,
        calories,
        timeFrame,
        date: new Date().toISOString()
      }));
      setHasRecentPlan(true);
      
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Failed to generate meal plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPlan = () => {
    const recentPlanData = localStorage.getItem('recentMealPlan');
    if (recentPlanData) {
      const data = JSON.parse(recentPlanData);
      setMealPlan(data.plan);
      setDiet(data.diet || '');
      setCalories(data.calories || '2000');
      setTimeFrame(data.timeFrame || 'day');
    }
  };
  
  const savePlan = () => {
    if (!mealPlan) return;
    
    const planToSave = {
      id: Date.now(),
      plan: mealPlan,
      diet,
      calories,
      timeFrame,
      date: new Date().toISOString()
    };
    
    const updatedPlans = [...savedPlans, planToSave];
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedMealPlans', JSON.stringify(updatedPlans));
    
    // Show save confirmation
    const saveConfirm = document.getElementById('save-confirmation');
    saveConfirm.classList.add('show');
    setTimeout(() => {
      saveConfirm.classList.remove('show');
    }, 3000);
  };
  
  const deleteSavedPlan = (id) => {
    const updatedPlans = savedPlans.filter(plan => plan.id !== id);
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedMealPlans', JSON.stringify(updatedPlans));
  };
  
  const loadSavedPlan = (id) => {
    const planToLoad = savedPlans.find(plan => plan.id === id);
    if (planToLoad) {
      setMealPlan(planToLoad.plan);
      setDiet(planToLoad.diet || '');
      setCalories(planToLoad.calories || '2000');
      setTimeFrame(planToLoad.timeFrame || 'day');
    }
  };

  const formatNutrients = (nutrients) => {
    if (!nutrients) return null;
    
    return (
      <div className="meal-plan-nutrients">
        <div className="nutrient">
          <span className="nutrient-name">Calories</span>
          <span className="nutrient-value">{Math.round(nutrients.calories)}</span>
          <div className="nutrient-bar">
            <div className="nutrient-fill" style={{width: `${Math.min(nutrients.calories / 30, 100)}%`}}></div>
          </div>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Protein</span>
          <span className="nutrient-value">{Math.round(nutrients.protein)}g</span>
          <div className="nutrient-bar">
            <div className="nutrient-fill protein-fill" style={{width: `${Math.min(nutrients.protein * 2, 100)}%`}}></div>
          </div>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Fat</span>
          <span className="nutrient-value">{Math.round(nutrients.fat)}g</span>
          <div className="nutrient-bar">
            <div className="nutrient-fill fat-fill" style={{width: `${Math.min(nutrients.fat * 2, 100)}%`}}></div>
          </div>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Carbs</span>
          <span className="nutrient-value">{Math.round(nutrients.carbohydrates)}g</span>
          <div className="nutrient-bar">
            <div className="nutrient-fill carbs-fill" style={{width: `${Math.min(nutrients.carbohydrates / 2, 100)}%`}}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayPlan = (meals, nutrients) => (
    <div className="day-plan">
      <div className="meal-plan-summary">
        <h3>Daily Summary</h3>
        {formatNutrients(nutrients)}
        <div className="meal-plan-actions">
          <button onClick={savePlan} className="save-plan-button">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M5 21h14a2 2 0 0 0 2-2V8l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zM7 5h4v2h2V5h2v4H7V5zm0 8h10v8H7v-8z"/>
            </svg>
            Save This Plan
          </button>
          <button onClick={() => window.print()} className="print-plan-button">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 12v2H8v-4h8v2zm2-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z"/>
            </svg>
            Print
          </button>
        </div>
      </div>
      
      <div className="meals-container">
        <div className="meals-header">
          <h3>Daily Meals</h3>
          <span className="meals-count">{meals.length} meals</span>
        </div>
        
        {meals.map((meal, index) => (
          <div key={meal.id} className="meal-plan-item">
            <img 
              src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`} 
              alt={meal.title} 
              className="meal-image" 
            />
            <div className="meal-content">
              <h4>{meal.title}</h4>
              <div className="meal-meta">
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  {meal.readyInMinutes} min
                </span>
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  {meal.servings} serving(s)
                </span>
              </div>
              <div className="meal-actions">
                <Link 
                  to={`/meal/${meal.idMeal ? meal.idMeal : meal.id.toString()}`}
                  className="view-recipe-link"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  View Recipe
                </Link>
                <FavoriteButton mealId={meal.idMeal ? meal.idMeal : meal.id.toString()} small={true} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeekPlan = (week) => (
    <div className="week-plan">
      {Object.keys(week).map((day) => (
        <div key={day} className="day-container">
          <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
          {renderDayPlan(week[day].meals, week[day].nutrients)}
        </div>
      ))}
    </div>
  );

  const renderInspiration = () => (
    <div className="inspiration-section">
      <h3>Need Inspiration?</h3>
      {inspirationMeal && (
        <div className="inspiration-meal">
          <img 
            src={inspirationMeal.strMealThumb} 
            alt={inspirationMeal.strMeal} 
            className="inspiration-image" 
          />
          <div className="inspiration-content">
            <h4>Featured Recipe: {inspirationMeal.strMeal}</h4>
            <p>Why not build a meal plan around this {inspirationMeal.strCategory.toLowerCase()} dish?</p>
            <Link to={`/meal/${inspirationMeal.idMeal}`} className="inspiration-button">
              See Recipe
            </Link>
          </div>
        </div>
      )}
      <div className="diet-tips">
        <div className="diet-tip-item">
          <h4>Balanced Diet</h4>
          <p>Aim for 45-65% carbs, 10-35% protein, and 20-35% fat for a well-balanced daily intake.</p>
        </div>
        <div className="diet-tip-item">
          <h4>Meal Timing</h4>
          <p>Try to distribute your calories throughout the day with 3 main meals and 1-2 snacks.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <h2 className="page-title">Meal Planner</h2>
        <p className="planner-intro">
          Generate a personalized meal plan based on your dietary preferences and calorie goals.
        </p>
      </div>
      
      <div className="planner-container">
        <div className="planner-sidebar">
          <form onSubmit={handleSubmit} className="meal-plan-form">
            <div className="form-header">
              <h3>Create Your Meal Plan</h3>
            </div>
            
            <div className="form-group">
              <label htmlFor="diet">Dietary Preference</label>
              <select 
                id="diet" 
                value={diet} 
                onChange={(e) => setDiet(e.target.value)}
              >
                {dietOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="calories">Target Calories</label>
              <input 
                type="number" 
                id="calories" 
                min="800" 
                max="4000" 
                value={calories} 
                onChange={(e) => setCalories(e.target.value)}
                required
              />
              <div className="calorie-slider">
                <input 
                  type="range" 
                  min="800" 
                  max="4000" 
                  step="50"
                  value={calories} 
                  onChange={(e) => setCalories(e.target.value)}
                />
                <div className="slider-markers">
                  <span>800</span>
                  <span>2000</span>
                  <span>4000</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timeFrame">Plan Duration</label>
              <div className="time-frame-toggle">
                <button 
                  type="button" 
                  className={`time-frame-button ${timeFrame === 'day' ? 'active' : ''}`}
                  onClick={() => setTimeFrame('day')}
                >
                  Daily
                </button>
                <button 
                  type="button" 
                  className={`time-frame-button ${timeFrame === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeFrame('week')}
                >
                  Weekly
                </button>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button type="submit" className="generate-button" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Meal Plan'}
              </button>
              
              {hasRecentPlan && !loading && !mealPlan && (
                <button 
                  type="button" 
                  onClick={loadRecentPlan} 
                  className="load-recent-button"
                >
                  Load Recent Plan
                </button>
              )}
            </div>
          </form>
          
          {savedPlans.length > 0 && (
            <div className="saved-plans-section">
              <h3>Your Saved Plans</h3>
              <div className="saved-plans-list">
                {savedPlans.map(plan => (
                  <div key={plan.id} className="saved-plan-item">
                    <div className="saved-plan-info">
                      <div className="saved-plan-title">
                        {plan.diet ? `${plan.diet.charAt(0).toUpperCase() + plan.diet.slice(1)} Diet` : 'Custom Plan'}
                      </div>
                      <div className="saved-plan-meta">
                        <span>{plan.calories} kcal</span>
                        <span>{plan.timeFrame === 'day' ? 'Daily' : 'Weekly'}</span>
                        <span className="saved-date">
                          {new Date(plan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="saved-plan-actions">
                      <button 
                        onClick={() => loadSavedPlan(plan.id)}
                        className="load-saved-button"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => deleteSavedPlan(plan.id)}
                        className="delete-saved-button"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="planner-content">
          {loading && (
            <div className="loading-container">
              <LoadingSpinner size="large" />
              <p>Generating your perfect meal plan...</p>
              <p className="loading-subtext">This may take a moment as we create personalized recipes for you.</p>
            </div>
          )}

          {mealPlan && !loading && (
            <div className="meal-plan-results">
              <h3 className="results-title">Your Personalized Meal Plan</h3>
              
              {timeFrame === 'day' && mealPlan.meals && renderDayPlan(mealPlan.meals, mealPlan.nutrients)}
              {timeFrame === 'week' && mealPlan.week && renderWeekPlan(mealPlan.week)}
            </div>
          )}
          
          {!mealPlan && !loading && renderInspiration()}
        </div>
      </div>
      
      <div id="save-confirmation" className="save-confirmation">
        Plan saved successfully!
      </div>
    </div>
  );
}

export default MealPlanner;
