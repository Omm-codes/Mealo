import React, { useState, useEffect } from 'react';
import { getAIRecipeSuggestions, fetchPopularMeals } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AiRecipeGenerator.css';

function AiRecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inspirationVisible, setInspirationVisible] = useState(true);
  const [trendingIngredients, setTrendingIngredients] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Common ingredient categories for inspiration
  const ingredientCategories = [
    {
      name: "Proteins",
      items: ["chicken breast", "ground beef", "salmon", "tofu", "eggs", "chickpeas"]
    },
    {
      name: "Vegetables",
      items: ["spinach", "broccoli", "bell peppers", "carrots", "zucchini", "onions"]
    },
    {
      name: "Grains & Starches",
      items: ["rice", "pasta", "quinoa", "potatoes", "bread", "oats"]
    },
    {
      name: "Quick Meals",
      items: ["canned tuna, mayo, bread", "eggs, cheese, spinach", "frozen vegetables, rice, soy sauce"]
    }
  ];
  
  // Popular cuisine preferences
  const popularCuisines = [
    "Italian", "Mexican", "Asian", "Mediterranean", "Indian", "American"
  ];
  
  // Popular dietary preferences
  const dietaryOptions = [
    "vegetarian", "vegan", "gluten-free", "low-carb", "high-protein", "kid-friendly"
  ];
  
  // Fetch common ingredients from popular meals
  useEffect(() => {
    const fetchTrendingIngredients = async () => {
      setTrendingLoading(true);
      try {
        const popularMeals = await fetchPopularMeals(5);
        // Extract some ingredient names from popular meals
        const extractedIngredients = new Set();
        popularMeals.forEach(meal => {
          for (let i = 1; i <= 5; i++) {
            const ingredient = meal[`strIngredient${i}`];
            if (ingredient && ingredient.trim() && ingredient.length > 2) {
              extractedIngredients.add(ingredient.trim().toLowerCase());
            }
          }
        });
        setTrendingIngredients(Array.from(extractedIngredients).slice(0, 8));
      } catch (error) {
        console.error("Error fetching trending ingredients:", error);
        setTrendingIngredients([
          "chicken", "onion", "tomatoes", "garlic", "olive oil", "potatoes", "bell pepper", "pasta"
        ]);
      } finally {
        setTrendingLoading(false);
      }
    };
    
    fetchTrendingIngredients();
  }, []);

  const handleAddIngredient = (ingredient) => {
    if (ingredients) {
      const currentIngredients = ingredients.split(',').map(i => i.trim());
      if (!currentIngredients.includes(ingredient)) {
        setIngredients(prev => prev ? `${prev}, ${ingredient}` : ingredient);
      }
    } else {
      setIngredients(ingredient);
    }
  };

  const handleAddCuisine = (cuisine) => {
    setPreferences(prev => {
      const currentPrefs = prev.split(',').map(p => p.trim()).filter(p => p);
      if (!currentPrefs.includes(cuisine)) {
        return prev ? `${prev}, ${cuisine}` : cuisine;
      }
      return prev;
    });
  };
  
  const handleClearForm = () => {
    setIngredients('');
    setPreferences('');
    setInspirationVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      setError('Please enter ingredients to generate recipes');
      return;
    }

    setLoading(true);
    setError('');
    setInspirationVisible(false);
    setLoadingStep(0);
    
    // Set up step transitions
    const stepTimer = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= 2) {
          clearInterval(stepTimer);
          return 2;
        }
        return prev + 1;
      });
    }, 5000); // Change step every 5 seconds
    
    try {
      // Prepare query with ingredients and preferences
      const fullQuery = preferences.trim() 
        ? `${ingredients}. Preferences: ${preferences}`
        : ingredients;
        
      const suggestions = await getAIRecipeSuggestions(fullQuery);
      setRecipes(suggestions);
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Failed to generate recipes. Please try again later.');
    } finally {
      setLoading(false);
      clearInterval(stepTimer); // Make sure to clear the timer
    }
  };

  const printRecipe = (recipe) => {
    const printContent = `
      <html>
      <head>
        <title>${recipe.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #a0430a; }
          .meta { color: #666; margin-bottom: 20px; }
          h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <h1>${recipe.name}</h1>
        <div class="meta">
          <p>Cooking Time: ${recipe.cookingTime} minutes | Difficulty: ${recipe.difficulty}</p>
        </div>
        <h2>Ingredients</h2>
        <ul>
          ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h2>Instructions</h2>
        <ol>
          ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
        <p><em>Generated by MEALO AI Recipe Generator</em></p>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const RecipeCard = ({ recipe, index }) => (
    <div className="ai-recipe-card">
      <div className="recipe-card-header">
        <h3>{recipe.name}</h3>
        <button 
          onClick={() => printRecipe(recipe)} 
          className="print-recipe-button" 
          title="Print Recipe"
        >
          <span className="print-icon">🖨️</span>
        </button>
      </div>
      <div className="recipe-meta">
        <span className="recipe-time">
          <span className="meta-icon">⏱️</span> 
          {recipe.cookingTime} minutes
        </span>
        <span className="recipe-difficulty">
          <span className="meta-icon">📊</span> 
          {recipe.difficulty}
        </span>
      </div>
      
      <div className="recipe-section">
        <h4>Ingredients</h4>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div className="recipe-section">
        <h4>Instructions</h4>
        <ol className="instructions-list">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div className="ai-recipe-generator">
      <div className="ai-header">
        <h2 className="page-title">AI Recipe Generator</h2>
        <p className="ai-intro">
          Enter ingredients you have on hand, and our AI will create custom recipes for you!
        </p>
      </div>

      <div className="ai-generator-container">
        <form onSubmit={handleSubmit} className="ai-recipe-form">
          <div className="form-group">
            <label htmlFor="ingredients">What ingredients do you have? / Recipe you wanna make?</label>
            <textarea 
              id="ingredients"
              placeholder="Enter ingredients separated by commas (e.g., chicken, rice, broccoli, olive oil) / Your Recipe name."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="preferences">Preferences or Dietary Requirements (Optional)</label>
            <input 
              type="text" 
              id="preferences"
              placeholder="E.g., vegetarian, low-carb, gluten-free, quick, Italian, spicy, etc."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button type="button" onClick={handleClearForm} className="clear-button">
              Clear Form
            </button>
            <button type="submit" className="generate-button" disabled={loading || !ingredients.trim()}>
              {loading ? 'Generating...' : 'Create Custom Recipes'}
            </button>
          </div>
        </form>

        {inspirationVisible && !loading && recipes.length === 0 && (
          <div className="inspiration-section">
            <h3 className="inspiration-title">Need Inspiration?</h3>
            
            <div className="ingredient-categories">
              {ingredientCategories.map((category, idx) => (
                <div key={idx} className="ingredient-category">
                  <h4>{category.name}</h4>
                  <div className="ingredient-chips">
                    {category.items.map((item, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        className="ingredient-chip"
                        onClick={() => handleAddIngredient(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {!trendingLoading && trendingIngredients.length > 0 && (
              <div className="trending-ingredients">
                <h4>Popular Ingredients</h4>
                <div className="ingredient-chips popular-chips">
                  {trendingIngredients.map((ingredient, idx) => (
                    <button 
                      key={idx} 
                      className="ingredient-chip popular-chip" 
                      onClick={() => handleAddIngredient(ingredient)}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="preference-suggestions">
              <h4>Cuisine Preferences</h4>
              <div className="cuisine-chips">
                {popularCuisines.map((cuisine, idx) => (
                  <button 
                    key={idx} 
                    className="cuisine-chip" 
                    onClick={() => handleAddCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              
              <h4>Dietary Preferences</h4>
              <div className="diet-chips">
                {dietaryOptions.map((diet, idx) => (
                  <button 
                    key={idx} 
                    className="diet-chip" 
                    onClick={() => handleAddCuisine(diet)}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-container entered">
          <div className="loading-animation">
            <div className="cooking-pot">
              <div className="pot-body">
                <div className="steam-container">
                  <div className="steam steam-1"></div>
                  <div className="steam steam-2"></div>
                  <div className="steam steam-3"></div>
                  <div className="steam steam-4"></div>
                </div>
                <div className="pot-contents">
                  <div className="bubble bubble-1"></div>
                  <div className="bubble bubble-2"></div>
                  <div className="bubble bubble-3"></div>
                </div>
              </div>
              <div className="pot-handles"></div>
            </div>
          </div>
          <h3 className="loading-title">Cooking up your recipes...</h3>
          <div className="loading-steps">
            <div className={`loading-step ${loadingStep === 0 ? 'active' : ''}`}>
              <span className="step-icon">📋</span>
              <span className="step-text">Analyzing ingredients</span>
            </div>
            <div className={`loading-step ${loadingStep === 1 ? 'active' : ''}`}>
              <span className="step-icon">🧪</span>
              <span className="step-text">Finding flavor combinations</span>
            </div>
            <div className={`loading-step ${loadingStep === 2 ? 'active' : ''}`}>
              <span className="step-icon">👨‍🍳</span>
              <span className="step-text">Creating custom recipes</span>
            </div>
          </div>
          <p className="loading-subtext">This usually takes 15-30 seconds</p>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="ai-recipes-results">
          <h3>Your Custom Recipes</h3>
          <div className="ai-recipes-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} index={index} />
            ))}
          </div>
          <div className="recipes-actions">
            <button 
              className="start-over-button" 
              onClick={() => {
                setRecipes([]);
                setInspirationVisible(true);
              }}
            >
              Generate New Recipes
            </button>
          </div>
        </div>
      )}
      
      <div className="ai-attribution">
        <p>Powered by advanced AI technology. Results may vary based on the ingredients provided.</p>
      </div>
    </div>
  );
}

export default AiRecipeGenerator;
