// API keys and base URLs
const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY ;
const SPOONACULAR_BASE_URL = process.env.REACT_APP_SPOONACULAR_BASE_URL;
const MEAL_DB_BASE_URL = process.env.REACT_APP_MEAL_DB_BASE_URL;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// Helper function to format meal data from Spoonacular to match our app's expected structure
const formatSpoonacularMeal = (meal) => {
  return {
    idMeal: meal.id.toString(),
    strMeal: meal.title,
    strMealThumb: meal.image.startsWith('http') 
      ? meal.image 
      : `https://spoonacular.com/recipeImages/${meal.image}`,
    strCategory: meal.dishTypes && meal.dishTypes.length > 0 ? meal.dishTypes[0] : 'Main Course',
    strArea: meal.cuisines && meal.cuisines.length > 0 ? meal.cuisines[0] : 'International',
    strInstructions: meal.instructions || '',
    strYoutube: meal.sourceUrl || '',
    strSource: meal.sourceUrl,
    nutrition: meal.nutrition || null,
    vegetarian: meal.vegetarian || false,
    vegan: meal.vegan || false,
    glutenFree: meal.glutenFree || false,
    dairyFree: meal.dairyFree || false,
    healthScore: meal.healthScore || 0,
    readyInMinutes: meal.readyInMinutes || 0,
    sourceName: meal.sourceName || '',
    ...meal.extendedIngredients?.reduce((acc, ing, i) => {
      const index = i + 1;
      acc[`strIngredient${index}`] = ing.name;
      acc[`strMeasure${index}`] = `${ing.amount} ${ing.unit}`;
      return acc;
    }, {})
  };
};

// Helper function to format recipe card data from Spoonacular
const formatSpoonacularRecipeCard = (recipe) => {
  return {
    idMeal: recipe.id.toString(),
    strMeal: recipe.title,
    strMealThumb: recipe.image.startsWith('http') 
      ? recipe.image 
      : `https://spoonacular.com/recipeImages/${recipe.image}`,
    strCategory: recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : '',
    strArea: recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines[0] : '',
    readyInMinutes: recipe.readyInMinutes || 0,
    vegetarian: recipe.vegetarian || false,
    vegan: recipe.vegan || false,
    glutenFree: recipe.glutenFree || false,
    dairyFree: recipe.dairyFree || false,
    apiSource: 'spoonacular'
  };
};

// Helper function to mark meals with their API source
const markMealDBMeal = (meal) => {
  return {
    ...meal,
    apiSource: 'mealdb'
  };
};

// Random meal - Using TheMealDB for simplicity and speed
export const fetchRandomMeal = async () => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? markMealDBMeal(data.meals[0]) : null;
  } catch (error) {
    console.error('Error fetching random meal:', error);
    throw error;
  }
};

// Fetch meal by ID - Trying both APIs based on ID format
export const fetchMealById = async (id) => {
  try {
    // If id is numeric only (Spoonacular)
    if (/^\d+$/.test(id)) {
      try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`);
        const data = await response.json();
        return formatSpoonacularMeal(data);
      } catch (spoonError) {
        console.error('Spoonacular fetch failed, trying TheMealDB:', spoonError);
      }
    }

    // Try TheMealDB (fallback or if id is not numeric-only)
    const response = await fetch(`${MEAL_DB_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? markMealDBMeal(data.meals[0]) : null;
  } catch (error) {
    console.error(`Error fetching meal ${id}:`, error);
    throw error;
  }
};

// Search meals by name - Using TheMealDB for basic name search
export const searchMealsByName = async (query) => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/search.php?s=${query}`);
    const data = await response.json();
    return data.meals ? data.meals.map(meal => markMealDBMeal(meal)) : [];
  } catch (error) {
    console.error('Error searching meals:', error);
    throw error;
  }
};

// Fetch meals by category - Using TheMealDB for basic category search
export const fetchMealsByCategory = async (category) => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals ? data.meals.map(meal => markMealDBMeal(meal)) : [];
  } catch (error) {
    console.error(`Error fetching meals for category ${category}:`, error);
    throw error;
  }
};

// Fetch meals by area/cuisine - Using TheMealDB
export const fetchMealsByArea = async (area) => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/filter.php?a=${area}`);
    const data = await response.json();
    return data.meals ? data.meals.map(meal => markMealDBMeal(meal)) : [];
  } catch (error) {
    console.error(`Error fetching meals for area ${area}:`, error);
    throw error;
  }
};

// Fetch categories - Using TheMealDB for basic categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch cuisines/areas - Using TheMealDB for basic areas
export const fetchAreas = async () => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/list.php?a=list`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

// NEW API FEATURES

// Advanced recipe search with filters - Using Spoonacular
export const advancedRecipeSearch = async (params) => {
  try {
    const queryParams = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ...params,
      addRecipeInformation: true,
      number: params.number || 10
    });

    const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?${queryParams}`);
    const data = await response.json();
    
    return data.results ? data.results.map(recipe => formatSpoonacularRecipeCard(recipe)) : [];
  } catch (error) {
    console.error('Error performing advanced recipe search:', error);
    throw error;
  }
};

// Get nutritional information for a recipe - Using Spoonacular
export const getNutritionInfo = async (id) => {
  try {
    const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching nutrition info for meal ${id}:`, error);
    throw error;
  }
};

// Get recipe suggestions based on ingredients - Using Groq
export const getAIRecipeSuggestions = async (ingredients, preferences = '') => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cooking assistant. Generate creative recipe ideas based on the ingredients provided. Format your response as a JSON array with 3 recipe objects. Each object should have: name, ingredients (array), instructions (array of steps), cookingTime (in minutes), and difficulty (Easy/Medium/Hard).'
          },
          {
            role: 'user',
            content: `Generate 3 recipe ideas using some or all of these ingredients: ${ingredients}. ${preferences ? 'Preferences: ' + preferences : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Parse the response content to extract the JSON
    const content = data.choices[0].message.content;
    // Find JSON in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse AI response JSON:', e);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error getting AI recipe suggestions:', error);
    return [];
  }
};

// Get wine pairings for a meal - Using Spoonacular
export const getWinePairing = async (food) => {
  try {
    const response = await fetch(`${SPOONACULAR_BASE_URL}/food/wine/pairing?food=${encodeURIComponent(food)}&apiKey=${SPOONACULAR_API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting wine pairing:', error);
    throw error;
  }
};

// Get meal plans by diet - Using Spoonacular
export const getMealPlanByDiet = async (diet, calories, timeFrame = 'day') => {
  try {
    const response = await fetch(`${SPOONACULAR_BASE_URL}/mealplanner/generate?apiKey=${SPOONACULAR_API_KEY}&diet=${diet}&targetCalories=${calories}&timeFrame=${timeFrame}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};
