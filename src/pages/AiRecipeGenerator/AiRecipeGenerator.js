import React, { useState } from 'react';
import { getAIRecipeSuggestions } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AiRecipeGenerator.css';

function AiRecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const suggestions = await getAIRecipeSuggestions(ingredients, preferences);
      setRecipes(suggestions);
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Failed to generate recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const RecipeCard = ({ recipe, index }) => (
    <div className="ai-recipe-card">
      <h3>{recipe.name}</h3>
      <div className="recipe-meta">
        <span>⏱️ {recipe.cookingTime} minutes</span>
        <span>🔥 {recipe.difficulty}</span>
      </div>
      
      <div className="recipe-section">
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div className="recipe-section">
        <h4>Instructions</h4>
        <ol>
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div className="ai-recipe-generator">
      <h2 className="page-title">AI Recipe Generator</h2>
      <p className="ai-intro">
        Enter ingredients you have on hand, and our AI will create custom recipe ideas for you!
      </p>

      <form onSubmit={handleSubmit} className="ai-recipe-form">
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea 
            id="ingredients"
            placeholder="Enter ingredients separated by commas (e.g., chicken, rice, broccoli, olive oil)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="preferences">Preferences (Optional)</label>
          <input 
            type="text" 
            id="preferences"
            placeholder="E.g., vegetarian, low-carb, gluten-free, quick, Italian, etc."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="generate-button" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Recipes'}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Cooking up ideas... This might take a moment</p>
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
        </div>
      )}
    </div>
  );
}

export default AiRecipeGenerator;
