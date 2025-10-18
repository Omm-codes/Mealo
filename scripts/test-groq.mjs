const key = process.env.GROQ_API_KEY || process.env.REACT_APP_GROQ_API_KEY;
if (!key) { console.error('Missing GROQ_API_KEY/REACT_APP_GROQ_API_KEY'); process.exit(1); }

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: 'Say OK' }],
    max_tokens: 5,
  }),
});

console.log(res.status, res.statusText);
const data = await res.json();
console.log(data.choices?.[0]?.message?.content ?? data);