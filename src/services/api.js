// API keys and base URLs
const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY ;
const SPOONACULAR_BASE_URL = process.env.REACT_APP_SPOONACULAR_BASE_URL;
const MEAL_DB_BASE_URL = process.env.REACT_APP_MEAL_DB_BASE_URL;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// Helper function to format recipe card data from Spoonacular
const formatSpoonacularRecipeCard = (recipe) => {
  // Make sure we have a valid recipe object
  if (!recipe || !recipe.id) {
    return null;
  }
  
  const imageUrl = recipe.image 
    ? (recipe.image.startsWith('http') 
        ? recipe.image 
        : `https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg`)
    : 'https://via.placeholder.com/300x200?text=No+Image';
    
  return {
    idMeal: recipe.id ? recipe.id.toString() : '', // Always string
    strMeal: recipe.title || 'Unnamed Recipe',
    strMealThumb: imageUrl,
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

// Helper function to format meal data from Spoonacular to match our app's expected structure
const formatSpoonacularMeal = (meal) => {
  return {
    idMeal: meal.id ? meal.id.toString() : '', // Always string
    strMeal: meal.title,
    strMealThumb: meal.image.startsWith('http') 
      ? meal.image 
      : `https://spoonacular.com/recipeImages/${meal.id}-556x370.jpg`, // Use higher resolution
    strCategory: meal.dishTypes && meal.dishTypes.length > 0 ? meal.dishTypes[0] : 'Main Course',
    strArea: meal.cuisines && meal.cuisines.length > 0 ? meal.cuisines[0] : 'International',
    strInstructions: meal.instructions || '',
    strYoutube: meal.sourceUrl || '',
    strSource: meal.sourceUrl,
    nutrition: meal.nutrition || null,
    hasNutritionData: true, // Spoonacular meals always have nutrition data available
    vegetarian: meal.vegetarian || false,
    vegan: meal.vegan || false,
    glutenFree: meal.glutenFree || false,
    dairyFree: meal.dairyFree || false,
    healthScore: meal.healthScore || 0,
    readyInMinutes: meal.readyInMinutes || 0,
    sourceName: meal.sourceName || '',
    apiSource: 'spoonacular',
    ...meal.extendedIngredients?.reduce((acc, ing, i) => {
      const index = i + 1;
      acc[`strIngredient${index}`] = ing.name;
      acc[`strMeasure${index}`] = `${ing.amount} ${ing.unit}`;
      return acc;
    }, {})
  };
};

// Helper function to mark meals with their API source
const markMealDBMeal = (meal) => {
  return {
    ...meal,
    idMeal: meal.idMeal ? meal.idMeal.toString() : '', // Always string
    apiSource: 'mealdb',
    hasNutritionData: false // TheMealDB meals don't have nutrition data
  };
};

// Enhanced random meal with better error handling
export const fetchRandomMeal = async () => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? markMealDBMeal(data.meals[0]) : null;
  } catch (error) {
    console.error('Error fetching random meal:', error);
    return null; // Return null instead of throwing to allow graceful handling
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

// Enhanced search with pagination support
export const searchMealsByNamePaginated = async (query, offset = 0, limit = 12) => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/search.php?s=${query}`);
    const data = await response.json();
    const meals = data.meals ? data.meals.map(meal => markMealDBMeal(meal)) : [];
    
    // Simulate pagination for TheMealDB (since it doesn't support it natively)
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedMeals = meals.slice(startIndex, endIndex);
    
    return {
      meals: paginatedMeals,
      totalCount: meals.length,
      hasMore: endIndex < meals.length
    };
  } catch (error) {
    console.error('Error searching meals:', error);
    return { meals: [], totalCount: 0, hasMore: false };
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

// Enhanced category meals with pagination
export const fetchMealsByCategoryPaginated = async (category, offset = 0, limit = 12) => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    const meals = data.meals ? data.meals.map(meal => markMealDBMeal(meal)) : [];
    
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedMeals = meals.slice(startIndex, endIndex);
    
    return {
      meals: paginatedMeals,
      totalCount: meals.length,
      hasMore: endIndex < meals.length
    };
  } catch (error) {
    console.error(`Error fetching meals for category ${category}:`, error);
    return { meals: [], totalCount: 0, hasMore: false };
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

// Get popular meals from TheMealDB instead of Spoonacular
export const fetchPopularMeals = async (count = 6) => {
  try {
    const meals = [];
    const maxAttempts = count * 2; // Try more to get unique meals
    const seenIds = new Set();
    
    for (let i = 0; i < maxAttempts && meals.length < count; i++) {
      const meal = await fetchRandomMeal();
      if (meal && !seenIds.has(meal.idMeal)) {
        seenIds.add(meal.idMeal);
        meals.push(meal);
      }
    }
    
    return meals;
  } catch (error) {
    console.error('Error fetching popular meals:', error);
    return [];
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

// Advanced recipe search - ONLY use Spoonacular when necessary
export const advancedRecipeSearch = async (params) => {
  try {
    // Only use Spoonacular for truly advanced searches
    const isAdvancedSearch = params.diet || params.intolerances || params.maxReadyTime || 
                           params.sort === 'popularity' || params.cuisine;
    
    if (!isAdvancedSearch && params.query) {
      // Use TheMealDB for basic searches
      console.log('Using TheMealDB for basic search');
      const result = await searchMealsByNamePaginated(params.query, 0, params.number || 10);
      return result.meals;
    }
    
    // Use Spoonacular for advanced features
    console.log('Using Spoonacular for advanced search');
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const queryParams = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ...cleanParams,
      addRecipeInformation: true,
      fillIngredients: true,
      number: params.number || 10
    });

    const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?${queryParams}`);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code && data.message) {
      console.error("Spoonacular API error:", data.message);
      return [];
    }
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Unexpected data format:", data);
      return [];
    }
    
    const formattedResults = data.results
      .map(recipe => formatSpoonacularRecipeCard(recipe))
      .filter(recipe => recipe !== null);
      
    return formattedResults;
  } catch (error) {
    console.error('Error performing advanced recipe search:', error);
    return [];
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

// Helper function to check if a meal has nutrition data available
export const hasNutritionData = (meal) => {
  // Check if the meal is from Spoonacular (numeric ID) or has the hasNutritionData flag set to true
  return (meal && (meal.hasNutritionData === true || (meal.idMeal && /^\d+$/.test(meal.idMeal))));
};

// Utility function to check if cached data is still valid
export const isCacheValid = (cacheKey, expiryInMinutes = 30) => {
  const cacheTimeKey = `${cacheKey}_time`;
  const cachedTime = localStorage.getItem(cacheTimeKey);
  
  if (!cachedTime) return false;
  
  const currentTime = new Date().getTime();
  const expiryTime = parseInt(cachedTime) + (expiryInMinutes * 60 * 1000);
  
  return currentTime < expiryTime;
};

// Get cached data if valid, otherwise fetch new data
export const getCachedOrFetch = async (cacheKey, fetchFunction, expiryInMinutes = 30) => {
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData && isCacheValid(cacheKey, expiryInMinutes)) {
    return JSON.parse(cachedData);
  }
  
  // Cache miss or expired, fetch new data
  const freshData = await fetchFunction();
  
  // Cache the new data
  localStorage.setItem(cacheKey, JSON.stringify(freshData));
  localStorage.setItem(`${cacheKey}_time`, new Date().getTime().toString());
  
  return freshData;
};
