import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMealById, getNutritionInfo } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './NutritionAnalysis.css';

function NutritionAnalysis() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the meal data
        const mealData = await fetchMealById(id);
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
  }, [id]);

  const renderMacronutrient = (name, amount, unit, percent = null) => (
    <div className="nutrient-item">
      <div className="nutrient-name">{name}</div>
      <div className="nutrient-value">
        {amount} {unit}
        {percent && <span className="nutrient-percent">({percent}%)</span>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="nutrition-container loading-state">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-container">
        <div className="error-message">{error}</div>
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
      <h2 className="page-title">Nutritional Analysis</h2>
      
      <div className="nutrition-header">
        <img 
          src={meal.strMealThumb} 
          alt={meal.strMeal}
          className="nutrition-image"
        />
        <div className="nutrition-title">
          <h3>{meal.strMeal}</h3>
          {meal.healthScore !== undefined && (
            <div className="health-score">
              <span>Health Score: {meal.healthScore}/100</span>
              <div className="health-meter">
                <div 
                  className="health-fill" 
                  style={{ width: `${meal.healthScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {nutritionUnavailable ? (
        <div className="nutrition-unavailable">
          <p>Detailed nutritional information is not available for this recipe.</p>
          <p>This may be due to the recipe source or API limitations.</p>
        </div>
      ) : (
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
          
          <div className="nutrition-details">
            <h4>Detailed Nutrition Facts</h4>
            <div className="nutrient-section">
              <h5>Macronutrients</h5>
              <div className="nutrient-list">
                {nutrition.carbs && renderMacronutrient('Carbohydrates', nutrition.carbs.split('g')[0], 'g')}
                {nutrition.fat && renderMacronutrient('Fat', nutrition.fat.split('g')[0], 'g')}
                {nutrition.protein && renderMacronutrient('Protein', nutrition.protein.split('g')[0], 'g')}
                {nutrition.sugar && renderMacronutrient('Sugar', nutrition.sugar.split('g')[0], 'g')}
                {nutrition.fiber && renderMacronutrient('Fiber', nutrition.fiber.split('g')[0], 'g')}
              </div>
            </div>
            
            {nutrition.bad && nutrition.bad.length > 0 && (
              <div className="nutrient-section">
                <h5>Nutrients to Limit</h5>
                <div className="nutrient-list">
                  {nutrition.bad.map((nutrient, index) => (
                    renderMacronutrient(
                      nutrient.title, 
                      nutrient.amount, 
                      nutrient.unit, 
                      nutrient.percentOfDailyNeeds
                    )
                  ))}
                </div>
              </div>
            )}
            
            {nutrition.good && nutrition.good.length > 0 && (
              <div className="nutrient-section">
                <h5>Beneficial Nutrients</h5>
                <div className="nutrient-list">
                  {nutrition.good.map((nutrient, index) => (
                    renderMacronutrient(
                      nutrient.title, 
                      nutrient.amount, 
                      nutrient.unit, 
                      nutrient.percentOfDailyNeeds
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="nutrition-disclaimer">
            <p>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
          </div>
        </>
      )}
      
      <div className="dietary-info">
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
    </div>
  );
}

export default NutritionAnalysis;
