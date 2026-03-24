import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const geminiMatch = envContent.match(/GEMINI_API_KEY="?([^"\n]*)"?/);
const API_KEY = geminiMatch ? geminiMatch[1] : null;

async function testGemini() {
  if (!API_KEY) {
    console.error("No API key found in .env");
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Respond with exactly one word: YES" }] }] })
    });
    const data = await response.json();
    if (data.error) {
       console.error("API Error Response:", data.error);
    } else {
       console.log("SUCCESS:", data.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error("FAILURE", err);
  }
}

testGemini();
