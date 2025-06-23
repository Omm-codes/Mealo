import React, { useState } from 'react';
import { getMealPlanByDiet } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './MealPlanner.css';

function MealPlanner() {
  const [diet, setDiet] = useState('');
  const [calories, setCalories] = useState('2000');
  const [timeFrame, setTimeFrame] = useState('day');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dietOptions = [
    { value: '', label: 'No restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Gluten Free' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'whole30', label: 'Whole30' }
  ];

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
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Failed to generate meal plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatNutrients = (nutrients) => {
    if (!nutrients) return null;
    
    return (
      <div className="meal-plan-nutrients">
        <div className="nutrient">
          <span className="nutrient-name">Calories:</span>
          <span className="nutrient-value">{Math.round(nutrients.calories)}</span>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Protein:</span>
          <span className="nutrient-value">{Math.round(nutrients.protein)}g</span>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Fat:</span>
          <span className="nutrient-value">{Math.round(nutrients.fat)}g</span>
        </div>
        <div className="nutrient">
          <span className="nutrient-name">Carbs:</span>
          <span className="nutrient-value">{Math.round(nutrients.carbohydrates)}g</span>
        </div>
      </div>
    );
  };

  const renderDayPlan = (meals, nutrients) => (
    <div className="day-plan">
      <div className="meal-plan-summary">
        <h3>Daily Summary</h3>
        {formatNutrients(nutrients)}
      </div>
      
      <div className="meals-container">
        {meals.map((meal) => (
          <div key={meal.id} className="meal-plan-item">
            <img 
              src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`} 
              alt={meal.title} 
              className="meal-image" 
            />
            <div className="meal-content">
              <h4>{meal.title}</h4>
              <div className="meal-meta">
                <span>Ready in {meal.readyInMinutes} minutes</span>
                <span>{meal.servings} serving(s)</span>
              </div>
              <a 
                href={meal.sourceUrl || `https://spoonacular.com/recipes/${meal.id}`} 
                target="_blank"
                rel="noreferrer"
                className="view-recipe-link"
              >
                View Recipe
              </a>
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

  return (
    <div className="meal-planner">
      <h2 className="page-title">Meal Planner</h2>
      <p className="planner-intro">
        Generate a personalized meal plan based on your dietary preferences and calorie goals.
      </p>

      <form onSubmit={handleSubmit} className="meal-plan-form">
        <div className="form-row">
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
          </div>

          <div className="form-group">
            <label htmlFor="timeFrame">Plan Duration</label>
            <select 
              id="timeFrame" 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="day">Daily Plan</option>
              <option value="week">Weekly Plan</option>
            </select>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="generate-button" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Meal Plan'}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Generating your perfect meal plan...</p>
        </div>
      )}

      {mealPlan && !loading && (
        <div className="meal-plan-results">
          <h3 className="results-title">Your Personalized Meal Plan</h3>
          
          {timeFrame === 'day' && mealPlan.meals && renderDayPlan(mealPlan.meals, mealPlan.nutrients)}
          {timeFrame === 'week' && mealPlan.week && renderWeekPlan(mealPlan.week)}
        </div>
      )}
    </div>
  );
}

export default MealPlanner;
