import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchMealById, getNutritionInfo, hasNutritionData } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './NutritionAnalysis.css';

function NutritionAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the meal data
        const mealData = await fetchMealById(id);
        
        // Check if nutrition data is available for this meal
        if (!mealData || !hasNutritionData(mealData)) {
          setError('Nutritional information is not available for this recipe.');
          setMeal(mealData); // Still set the meal so we can display its name
          setLoading(false);
          return;
        }
        
        setMeal(mealData);
        
        // If meal already contains nutrition data
        if (mealData.nutrition) {
          setNutrition(mealData.nutrition);
        } 
        // Otherwise fetch nutrition data separately
        else {
          try {
            const nutritionData = await getNutritionInfo(id);
            setNutrition(nutritionData);
          } catch (nutritionError) {
            console.error('Could not fetch nutrition info:', nutritionError);
            setError('Nutritional information not available for this recipe.');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recipe information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [id]);

  const renderMacronutrient = (name, amount, unit, percent = null, color = "#a0430a") => (
    <div className="nutrient-item">
      <div className="nutrient-name">{name}</div>
      <div className="nutrient-value">
        {amount} {unit}
        {percent && <span className="nutrient-percent">({percent}%)</span>}
      </div>
      {percent && (
        <div className="nutrient-bar-container">
          <div 
            className="nutrient-bar-fill" 
            style={{ 
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
      )}
    </div>
  );
  
  const getHealthScore = () => {
    if (meal?.healthScore !== undefined) {
      return meal.healthScore;
    }
    // Calculate estimated health score based on nutrition data
    if (nutrition) {
      let score = 50; // Start with neutral score
      
      // Adjust based on nutritional balance
      if (nutrition.good && nutrition.bad) {
        const goodNutrients = nutrition.good.length;
        const badNutrients = nutrition.bad.length;
        score += (goodNutrients - badNutrients) * 5;
      }
      
      // Adjust based on calories (assuming 2000 calorie diet)
      const calories = parseFloat(nutrition.calories);
      if (!isNaN(calories)) {
        if (calories < 300) score += 10;
        else if (calories > 800) score -= 10;
      }
      
      // Adjust based on fat content
      const fat = parseFloat(nutrition.fat);
      if (!isNaN(fat)) {
        if (fat < 10) score += 5;
        else if (fat > 30) score -= 10;
      }
      
      return Math.max(0, Math.min(100, score)); // Ensure 0-100 range
    }
    return 50; // Default score
  };
  
  const getHealthScoreColor = (score) => {
    if (score >= 80) return "#4CAF50"; // Green for high scores
    if (score >= 50) return "#FF9800"; // Orange for medium scores
    return "#F44336"; // Red for low scores
  };
  
  const getDailyValuePercentage = (amount, referenceAmount) => {
    if (!amount || !referenceAmount) return null;
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return null;
    return Math.round((amountValue / referenceAmount) * 100);
  };
  
  const renderOverviewTab = () => {
    if (nutritionUnavailable) {
      return (
        <div className="nutrition-unavailable">
          <svg viewBox="0 0 24 24" width="48" height="48" className="unavailable-icon">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h3>Nutritional Information Unavailable</h3>
          <p>Detailed nutritional information is not available for this recipe.</p>
          <p>This may be due to the recipe source or API limitations.</p>
          <Link to={`/meal/${id}`} className="back-to-recipe-btn">
            Back to Recipe
          </Link>
        </div>
      );
    }
    
    return (
      <>
        <div className="nutrition-summary">
          <div className="nutrition-fact">
            <div className="fact-value">{nutrition.calories || 'N/A'}</div>
            <div className="fact-name">Calories</div>
          </div>
          <div className="nutrition-fact">
            <div className="fact-value">{nutrition.carbs || 'N/A'}</div>
            <div className="fact-name">Carbs</div>
          </div>
          <div className="nutrition-fact">
            <div className="fact-value">{nutrition.fat || 'N/A'}</div>
            <div className="fact-name">Fat</div>
          </div>
          <div className="nutrition-fact">
            <div className="fact-value">{nutrition.protein || 'N/A'}</div>
            <div className="fact-name">Protein</div>
          </div>
        </div>
        
        <div className="macronutrients-distribution">
          <h4>Calorie Distribution</h4>
          <div className="macro-chart">
            {renderMacroChart()}
          </div>
          <div className="macro-legend">
            <div className="legend-item">
              <span className="color-box protein-color"></span>
              <span>Protein</span>
            </div>
            <div className="legend-item">
              <span className="color-box carbs-color"></span>
              <span>Carbs</span>
            </div>
            <div className="legend-item">
              <span className="color-box fat-color"></span>
              <span>Fat</span>
            </div>
          </div>
        </div>
        
        <div className="nutrient-section">
          <h4>Macronutrients</h4>
          <div className="nutrient-list">
            {nutrition.carbs && renderMacronutrient(
              'Carbohydrates', 
              nutrition.carbs.split('g')[0], 
              'g',
              getDailyValuePercentage(nutrition.carbs.split('g')[0], 275),
              "#42a5f5" // Blue for carbs
            )}
            {nutrition.fat && renderMacronutrient(
              'Fat', 
              nutrition.fat.split('g')[0], 
              'g',
              getDailyValuePercentage(nutrition.fat.split('g')[0], 78),
              "#ff9800" // Orange for fat
            )}
            {nutrition.protein && renderMacronutrient(
              'Protein', 
              nutrition.protein.split('g')[0], 
              'g',
              getDailyValuePercentage(nutrition.protein.split('g')[0], 50),
              "#8bc34a" // Green for protein
            )}
            {nutrition.fiber && renderMacronutrient(
              'Fiber', 
              nutrition.fiber.split('g')[0], 
              'g',
              getDailyValuePercentage(nutrition.fiber.split('g')[0], 28),
              "#795548" // Brown for fiber
            )}
            {nutrition.sugar && renderMacronutrient(
              'Sugar', 
              nutrition.sugar.split('g')[0], 
              'g',
              getDailyValuePercentage(nutrition.sugar.split('g')[0], 50),
              "#ec407a" // Pink for sugar
            )}
          </div>
        </div>
      </>
    );
  };
  
  const renderMacroChart = () => {
    const proteinValue = parseFloat(nutrition.protein?.split('g')[0]) || 0;
    const carbsValue = parseFloat(nutrition.carbs?.split('g')[0]) || 0;
    const fatValue = parseFloat(nutrition.fat?.split('g')[0]) || 0;
    
    // Calculate calories from each (protein 4cal/g, carbs 4cal/g, fat 9cal/g)
    const proteinCalories = proteinValue * 4;
    const carbsCalories = carbsValue * 4;
    const fatCalories = fatValue * 9;
    
    const totalCalories = proteinCalories + carbsCalories + fatCalories;
    
    // Calculate percentages, ensuring we don't divide by zero
    const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const carbsPercent = totalCalories > 0 ? (carbsCalories / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    
    return (
      <div className="macro-bar">
        <div className="macro-segment protein-segment" style={{width: `${proteinPercent}%`}}>
          {proteinPercent >= 10 && `${Math.round(proteinPercent)}%`}
        </div>
        <div className="macro-segment carbs-segment" style={{width: `${carbsPercent}%`}}>
          {carbsPercent >= 10 && `${Math.round(carbsPercent)}%`}
        </div>
        <div className="macro-segment fat-segment" style={{width: `${fatPercent}%`}}>
          {fatPercent >= 10 && `${Math.round(fatPercent)}%`}
        </div>
      </div>
    );
  };
  
  const renderVitaminsTab = () => {
    if (nutritionUnavailable || !nutrition.good || nutrition.good.length === 0) {
      return (
        <div className="nutrition-unavailable">
          <p>Detailed vitamin and mineral information is not available for this recipe.</p>
        </div>
      );
    }
    
    // Filter nutrients to get vitamins and minerals
    const vitaminsAndMinerals = nutrition.good.filter(nutrient => 
      nutrient.title.includes('Vitamin') || 
      nutrient.title.includes('Calcium') || 
      nutrient.title.includes('Iron') || 
      nutrient.title.includes('Zinc') ||
      nutrient.title.includes('Magnesium') ||
      nutrient.title.includes('Potassium') ||
      nutrient.title.includes('Copper') ||
      nutrient.title.includes('Selenium')
    );
    
    return (
      <div className="vitamins-container">
        <div className="vitamins-header">
          <p>Percentage of daily recommended intake</p>
        </div>
        <div className="vitamins-grid">
          {vitaminsAndMinerals.map((nutrient, index) => (
            <div key={index} className="vitamin-item">
              <div className="vitamin-name">{nutrient.title}</div>
              <div className="vitamin-bar-container">
                <div 
                  className="vitamin-bar-fill" 
                  style={{ width: `${Math.min(nutrient.percentOfDailyNeeds, 100)}%` }}
                ></div>
                <span className="vitamin-percent">{Math.round(nutrient.percentOfDailyNeeds)}%</span>
              </div>
              <div className="vitamin-amount">
                {nutrient.amount} {nutrient.unit}
              </div>
            </div>
          ))}
        </div>
        
        {vitaminsAndMinerals.length === 0 && (
          <p className="no-data-message">No vitamin or mineral data available for this recipe.</p>
        )}
      </div>
    );
  };
  
  const renderHealthTab = () => {
    const healthScore = getHealthScore();
    const scoreColor = getHealthScoreColor(healthScore);
    
    return (
      <div className="health-tab-container">
        <div className="health-score-card">
          <h4>Health Score</h4>
          <div className="circular-score" style={{ borderColor: scoreColor }}>
            <span style={{ color: scoreColor }}>{Math.round(healthScore)}</span>
            <small>/100</small>
          </div>
          <p className="score-description">
            {healthScore >= 80 && "This recipe has excellent nutritional value with a good balance of nutrients."}
            {healthScore >= 50 && healthScore < 80 && "This recipe has moderate nutritional value."}
            {healthScore < 50 && "This recipe may be high in calories or low in essential nutrients."}
          </p>
        </div>
        
        <div className="dietary-properties">
          <h4>Dietary Information</h4>
          <div className="diet-tags">
            {meal.vegetarian && <span className="diet-tag vegetarian">Vegetarian</span>}
            {meal.vegan && <span className="diet-tag vegan">Vegan</span>}
            {meal.glutenFree && <span className="diet-tag gluten-free">Gluten-Free</span>}
            {meal.dairyFree && <span className="diet-tag dairy-free">Dairy-Free</span>}
            {!meal.vegetarian && !meal.vegan && !meal.glutenFree && !meal.dairyFree && 
              <span className="diet-tag standard">Standard Diet</span>
            }
          </div>
        </div>
        
        {nutrition.bad && nutrition.bad.length > 0 && (
          <div className="nutrient-warnings">
            <h4>Nutrients to Monitor</h4>
            <div className="warning-list">
              {nutrition.bad
                .filter(nutrient => nutrient.percentOfDailyNeeds > 25)
                .map((nutrient, index) => (
                  <div key={index} className="warning-item">
                    <div className="warning-header">
                      <span className="warning-name">{nutrient.title}</span>
                      <span className="warning-value">{Math.round(nutrient.percentOfDailyNeeds)}% of daily value</span>
                    </div>
                    <div className="warning-bar-container">
                      <div 
                        className="warning-bar-fill" 
                        style={{ 
                          width: `${Math.min(nutrient.percentOfDailyNeeds, 100)}%`,
                          backgroundColor: nutrient.percentOfDailyNeeds > 70 ? "#F44336" : "#FF9800"
                        }}
                      ></div>
                    </div>
                    <p className="warning-info">
                      {nutrient.percentOfDailyNeeds > 70 
                        ? `This recipe is high in ${nutrient.title.toLowerCase()}.` 
                        : `This recipe contains a moderate amount of ${nutrient.title.toLowerCase()}.`
                      }
                    </p>
                  </div>
                ))
              }
              
              {nutrition.bad.filter(nutrient => nutrient.percentOfDailyNeeds > 25).length === 0 && (
                <p className="no-warnings">This recipe has no concerning levels of nutrients to limit.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="nutrition-container loading-state">
        <LoadingSpinner size="large" />
        <p className="loading-text">Analyzing nutritional content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-container">
        <div className="error-message">
          <svg viewBox="0 0 24 24" width="36" height="36" className="error-icon">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>{error}</p>
          {meal && (
            <p>Unfortunately, detailed nutrition analysis is only available for certain recipes in our database.</p>
          )}
          <Link to={meal ? `/meal/${id}` : '/search'} className="back-to-recipe-btn">
            {meal ? 'Back to Recipe' : 'Find Other Recipes'}
          </Link>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="nutrition-container">
        <div className="error-message">Recipe not found</div>
      </div>
    );
  }

  // Handle case where nutrition data is not available
  const nutritionUnavailable = !nutrition || Object.keys(nutrition).length === 0;

  return (
    <div className="nutrition-container">
      <div className="back-link-container">
        <Link to={`/meal/${id}`} className="back-link">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Recipe
        </Link>
      </div>
      
      <h2 className="page-title">Nutritional Analysis</h2>
      
      <div className="nutrition-header">
        <img 
          src={meal.strMealThumb} 
          alt={meal.strMeal}
          className="nutrition-image"
        />
        <div className="nutrition-title">
          <h3>{meal.strMeal}</h3>
          <div className="header-meta">
            <div className="serving-info">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span>Serving size: {meal.servings || 1} serving(s)</span>
            </div>
            {meal.readyInMinutes && (
              <div className="time-info">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>Ready in {meal.readyInMinutes} minutes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nutrition-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'vitamins' ? 'active' : ''}`} 
            onClick={() => setActiveTab('vitamins')}
          >
            Vitamins & Minerals
          </button>
          <button 
            className={`tab-button ${activeTab === 'health' ? 'active' : ''}`} 
            onClick={() => setActiveTab('health')}
          >
            Health Profile
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'vitamins' && renderVitaminsTab()}
          {activeTab === 'health' && renderHealthTab()}
        </div>
      </div>
      
      <div className="nutrition-disclaimer">
        <p>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
      </div>
    </div>
  );
}

export default NutritionAnalysis;
