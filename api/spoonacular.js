const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, params } = req.body;

  try {
    switch (action) {
      case 'complexSearch':
        return await handleComplexSearch(params, res);

      case 'getMealById':
        return await handleGetMealById(params, res);

      case 'getNutrition':
        return await handleGetNutrition(params, res);

      case 'getWinePairing':
        return await handleGetWinePairing(params, res);

      case 'getMealPlan':
        return await handleGetMealPlan(params, res);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Spoonacular API error:', error);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleComplexSearch(params, res) {
  const {
    query = '',
    diet = '',
    intolerances = [],
    cuisine = '',
    maxReadyTime,
    sort = 'popularity',
    number = 12
  } = params;

  const queryParams = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    query,
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    number: number.toString(),
    sort
  });

  if (diet) queryParams.append('diet', diet);
  if (cuisine) queryParams.append('cuisine', cuisine);
  if (maxReadyTime) queryParams.append('maxReadyTime', maxReadyTime.toString());
  if (intolerances.length > 0) {
    queryParams.append('intolerances', intolerances.join(','));
  }

  const url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json(data);
}

async function handleGetMealById(params, res) {
  const { id } = params;

  if (!id) {
    return res.status(400).json({ error: 'Missing meal ID' });
  }

  const url = `${SPOONACULAR_BASE_URL}/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json(data);
}

async function handleGetNutrition(params, res) {
  const { id } = params;

  if (!id) {
    return res.status(400).json({ error: 'Missing meal ID' });
  }

  const url = `${SPOONACULAR_BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json(data);
}

async function handleGetWinePairing(params, res) {
  const { food } = params;

  if (!food) {
    return res.status(400).json({ error: 'Missing food parameter' });
  }

  const url = `${SPOONACULAR_BASE_URL}/food/wine/pairing?food=${encodeURIComponent(food)}&apiKey=${SPOONACULAR_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json(data);
}

async function handleGetMealPlan(params, res) {
  const { diet, calories = 2000, timeFrame = 'day' } = params;

  if (!diet) {
    return res.status(400).json({ error: 'Missing diet parameter' });
  }

  const url = `${SPOONACULAR_BASE_URL}/mealplanner/generate?apiKey=${SPOONACULAR_API_KEY}&diet=${diet}&targetCalories=${calories}&timeFrame=${timeFrame}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json(data);
}
