async function callGemini(prompt) {
  const apiKey = "AIzaSyC8AOEwLYKAEAGHOODhd1K0UX68Tx8yBgw"; // from .env
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      topP: 0.85,
      maxOutputTokens: 1200,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  console.log("Success:", JSON.stringify(data, null, 2));
}

callGemini("Mansa x and other special funds");
