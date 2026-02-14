const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, params } = req.body;

  try {
    switch (action) {
      case 'getRecipeSuggestions':
        return await handleGetRecipeSuggestions(params, res);

      case 'testAPI':
        return await handleTestAPI(res);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Groq API error:', error);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetRecipeSuggestions(params, res) {
  const { ingredients = [], preferences = {} } = params;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' });
  }

  const prompt = buildRecipePrompt(ingredients, preferences);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in Groq response');
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in response');
  }

  try {
    const recipes = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ recipes });
  } catch (parseError) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('JSON parse error:', parseError);
    }
    throw new Error('Failed to parse recipe data');
  }
}

async function handleTestAPI(res) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: 'Say hello'
      }],
      temperature: 0.7,
      max_tokens: 50
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return res.status(200).json({
    success: true,
    message: 'Groq API is working',
    response: data.choices?.[0]?.message?.content
  });
}

function buildRecipePrompt(ingredients, preferences) {
  const { cuisine, difficulty, cookingTime, dietary } = preferences;

  let prompt = `Generate 3 creative and practical recipes using the following ingredients: ${ingredients.join(', ')}.\n\n`;

  if (cuisine) prompt += `Cuisine preference: ${cuisine}\n`;
  if (difficulty) prompt += `Difficulty level: ${difficulty}\n`;
  if (cookingTime) prompt += `Maximum cooking time: ${cookingTime} minutes\n`;
  if (dietary && dietary.length > 0) prompt += `Dietary restrictions: ${dietary.join(', ')}\n`;

  prompt += `\nReturn ONLY a JSON array with exactly 3 recipes in this format:\n`;
  prompt += `[
  {
    "name": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "cookingTime": 30,
    "difficulty": "Easy"
  }
]\n\n`;
  prompt += `Return ONLY the JSON array, no additional text.`;

  return prompt;
}
