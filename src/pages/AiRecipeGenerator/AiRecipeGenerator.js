import React, { useState, useEffect } from 'react';
import { getAIRecipeSuggestions, advancedRecipeSearch } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AiRecipeGenerator.css';

function AiRecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inspirationVisible, setInspirationVisible] = useState(true);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  
  // Input type selection
  const [inputType, setInputType] = useState('ingredients'); // 'ingredients' or 'recipe'
  
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
  
  // Fetch trending recipe names for inspiration
  useEffect(() => {
    const fetchTrendingRecipes = async () => {
      setTrendingLoading(true);
      try {
        const params = { 
          sort: "popularity", 
          number: 8
        };
        
        const recipes = await advancedRecipeSearch(params);
        setTrendingRecipes(recipes.map(recipe => recipe.strMeal));
      } catch (error) {
        console.error("Error fetching trending recipes:", error);
        setTrendingRecipes([
          "Chicken Parmesan", 
          "Beef Stir Fry", 
          "Vegetable Curry", 
          "Pasta Carbonara",
          "Salmon with Roasted Vegetables", 
          "Chocolate Chip Cookies"
        ]);
      } finally {
        setTrendingLoading(false);
      }
    };
    
    fetchTrendingRecipes();
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

  const handleSetRecipeName = (name) => {
    setRecipeName(name);
    setInputType('recipe');
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
    setRecipeName('');
    setPreferences('');
    setInspirationVisible(true);
    setInputType('ingredients');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ingredients.trim() && !recipeName.trim()) {
      setError('Please enter ingredients or a recipe name');
      return;
    }

    setLoading(true);
    setError('');
    setInspirationVisible(false);
    
    try {
      // Prepare query based on input type
      let queryString = '';
      
      if (inputType === 'ingredients') {
        queryString = ingredients;
      } else {
        queryString = `Create a recipe similar to: ${recipeName}`;
      }
      
      // Add preferences if provided
      const fullQuery = preferences.trim() 
        ? `${queryString}. Preferences: ${preferences}`
        : queryString;
        
      const suggestions = await getAIRecipeSuggestions(fullQuery);
      setRecipes(suggestions);
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Failed to generate recipes. Please try again later.');
    } finally {
      setLoading(false);
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
          Enter ingredients you have on hand or a recipe name, and our AI will create custom recipes for you!
        </p>
      </div>

      <div className="ai-generator-container">
        <form onSubmit={handleSubmit} className="ai-recipe-form">
          <div className="input-type-toggle">
            <button 
              type="button"
              className={`toggle-btn ${inputType === 'ingredients' ? 'active' : ''}`}
              onClick={() => setInputType('ingredients')}
            >
              I have ingredients
            </button>
            <button 
              type="button"
              className={`toggle-btn ${inputType === 'recipe' ? 'active' : ''}`}
              onClick={() => setInputType('recipe')}
            >
              I want a specific recipe
            </button>
          </div>

          {inputType === 'ingredients' ? (
            <div className="form-group">
              <label htmlFor="ingredients">What ingredients do you have?</label>
              <textarea 
                id="ingredients"
                placeholder="Enter ingredients separated by commas (e.g., chicken, rice, broccoli, olive oil)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="recipeName">What recipe are you looking for?</label>
              <input 
                type="text"
                id="recipeName"
                placeholder="E.g., Chicken Parmesan, Vegetable Curry, Chocolate Cake, etc."
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
              />
            </div>
          )}
          
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
            <button type="submit" className="generate-button" disabled={loading}>
              {loading ? 'Generating...' : 'Create Custom Recipes'}
            </button>
          </div>
        </form>

        {inspirationVisible && !loading && recipes.length === 0 && (
          <div className="inspiration-section">
            <h3 className="inspiration-title">Need Inspiration?</h3>
            
            {inputType === 'ingredients' && (
              <>
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
              </>
            )}
            
            {inputType === 'recipe' && !trendingLoading && (
              <div className="trending-recipes">
                <h4>Trending Recipe Ideas</h4>
                <div className="recipe-name-chips">
                  {trendingRecipes.map((recipe, idx) => (
                    <button 
                      key={idx} 
                      className="recipe-name-chip" 
                      onClick={() => handleSetRecipeName(recipe)}
                    >
                      {recipe}
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
        <div className="loading-container">
          <div className="cooking-animation">
            <LoadingSpinner size="large" />
            <div className="cooking-bubbles">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
            </div>
          </div>
          <p>Cooking up creative recipes with your ingredients...</p>
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
