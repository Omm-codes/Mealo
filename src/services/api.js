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
    id: recipe.id ? recipe.id.toString() : '', // Always string for Spoonacular
    idMeal: recipe.id ? recipe.id.toString() : '', // For compatibility
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
  const imageUrl = meal.image && meal.image.startsWith('http')
    ? meal.image
    : meal.id
      ? `https://spoonacular.com/recipeImages/${meal.id}-556x370.jpg`
      : 'https://via.placeholder.com/300x200?text=No+Image';

  return {
    id: meal.id ? meal.id.toString() : '', // Always string for Spoonacular
    idMeal: meal.id ? meal.id.toString() : '', // For compatibility
    strMeal: meal.title,
    strMealThumb: imageUrl,
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching random meal:', error);
    }
    return null; // Return null instead of throwing to allow graceful handling
  }
};

// Fetch meal by ID - Only use Spoonacular for advanced search, nutrition, and meal planner
export const fetchMealById = async (id, options = {}) => {
  try {
    // Only use Spoonacular if explicitly requested (for advanced search, nutrition, meal planner)
    if (options.useSpoonacular) {
      try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`);
        const data = await response.json();
        return formatSpoonacularMeal(data);
      } catch (spoonError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Spoonacular fetch failed:', spoonError);
        }
        return null;
      }
    }

    // Default: Use TheMealDB only
    const response = await fetch(`${MEAL_DB_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? markMealDBMeal(data.meals[0]) : null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching meal ${id}:`, error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error searching meals:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error searching meals:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching meals for category ${category}:`, error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching meals for category ${category}:`, error);
    }
    throw error;
  }
};

// Get popular meals from TheMealDB instead of Spoonacular
export const fetchPopularMeals = async (count = 6) => {
  try {
    const maxAttempts = count * 2; // Try more to get unique meals
    const seenIds = new Set();

    // Batch fetch meals in parallel
    const fetchBatch = async () => {
      const promises = Array(maxAttempts).fill(null).map(() => fetchRandomMeal());
      const results = await Promise.all(promises);

      const uniqueMeals = [];
      for (const meal of results) {
        if (meal && !seenIds.has(meal.idMeal) && uniqueMeals.length < count) {
          seenIds.add(meal.idMeal);
          uniqueMeals.push(meal);
        }
      }

      return uniqueMeals;
    };

    return await fetchBatch();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching popular meals:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching meals for area ${area}:`, error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching categories:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching areas:', error);
    }
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using TheMealDB for basic search');
      }
      const result = await searchMealsByNamePaginated(params.query, 0, params.number || 10);
      return result.meals;
    }

    // Use Spoonacular for advanced features
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using Spoonacular for advanced search');
    }
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
      if (process.env.NODE_ENV !== 'production') {
        console.error("Spoonacular API error:", data.message);
      }
      return [];
    }

    if (!data.results || !Array.isArray(data.results)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Unexpected data format:", data);
      }
      return [];
    }

    const formattedResults = data.results
      .map(recipe => formatSpoonacularRecipeCard(recipe))
      .filter(recipe => recipe !== null);

    return formattedResults;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error performing advanced recipe search:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching nutrition info for meal ${id}:`, error);
    }
    throw error;
  }
};

// Get recipe suggestions based on ingredients - Using Groq
export const getAIRecipeSuggestions = async (ingredients, preferences = '') => {
  try {
    // Validate API key
    if (!GROQ_API_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('GROQ API key is not configured');
      }
      throw new Error('AI service is not configured. Please check your API keys.');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending request to Groq API with ingredients:', ingredients);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cooking assistant. Generate creative recipe ideas based on the ingredients provided. You MUST respond with ONLY a valid JSON array containing exactly 3 recipe objects. Each object must have these fields: "name" (string), "ingredients" (array of strings), "instructions" (array of strings), "cookingTime" (number in minutes), and "difficulty" (string: "Easy", "Medium", or "Hard"). Do not include any text before or after the JSON array.'
          },
          {
            role: 'user',
            content: `Generate 3 recipe ideas using some or all of these ingredients: ${ingredients}. ${preferences ? 'Additional preferences: ' + preferences : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV !== 'production') {
        console.error('Groq API error response:', errorText);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log('Groq API response:', data);
    }

    if (data.error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Groq API returned error:', data.error);
      }
      throw new Error(data.error.message || 'API returned an error');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unexpected API response structure:', data);
      }
      throw new Error('Invalid response from AI service');
    }

    // Parse the response content to extract the JSON
    const content = data.choices[0].message.content;
    if (process.env.NODE_ENV !== 'production') {
      console.log('AI response content:', content);
    }

    // Try to find and parse JSON in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      try {
        const recipes = JSON.parse(jsonMatch[0]);

        // Validate the structure of recipes
        if (Array.isArray(recipes) && recipes.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Successfully parsed recipes:', recipes);
          }
          return recipes;
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Parsed JSON is not a valid array of recipes:', recipes);
          }
          throw new Error('Invalid recipe format returned');
        }
      } catch (parseError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to parse AI response JSON:', parseError);
          console.error('Content that failed to parse:', jsonMatch[0]);
        }
        throw new Error('Failed to parse recipe data from AI');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('No JSON array found in response:', content);
      }
      throw new Error('AI did not return recipe data in expected format');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error getting AI recipe suggestions:', error);
    }
    throw error; // Re-throw to let the component handle it
  }
};

// Get wine pairings for a meal - Using Spoonacular
export const getWinePairing = async (food) => {
  try {
    const response = await fetch(`${SPOONACULAR_BASE_URL}/food/wine/pairing?food=${encodeURIComponent(food)}&apiKey=${SPOONACULAR_API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error getting wine pairing:', error);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error generating meal plan:', error);
    }
    throw error;
  }
};

// Helper function to check if a meal has nutrition data available
export const hasNutritionData = (meal) => {
  // Only Spoonacular meals have nutrition data
  return meal && meal.apiSource === 'spoonacular';
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
    try {
      return JSON.parse(cachedData);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to parse cached data:', error);
      }
      // Clear invalid cache
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_time`);
    }
  }

  // Cache miss or expired, fetch new data
  const freshData = await fetchFunction();

  // Cache the new data
  try {
    localStorage.setItem(cacheKey, JSON.stringify(freshData));
    localStorage.setItem(`${cacheKey}_time`, new Date().getTime().toString());
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to cache data:', error);
    }
  }

  return freshData;
};

// Test function to verify GROQ API key is working
export const testGroqAPI = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Testing GROQ API key...');
      console.log('API Key exists:', !!GROQ_API_KEY);
      console.log('API Key starts with gsk_:', GROQ_API_KEY?.startsWith('gsk_'));
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: 'Say "API is working!" if you receive this message.'
          }
        ],
        max_tokens: 50
      })
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Response status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', errorText);
      }
      return { success: false, error: errorText };
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Response:', data);
    }
    return { success: true, data };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Test failed:', error);
    }
    return { success: false, error: error.message };
  }
};
