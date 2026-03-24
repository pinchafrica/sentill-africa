import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  if (!API_KEY) {
    console.error("No API key found in .env");
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log("SUCCESS");
    console.log(response.data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error("FAILURE", err.response?.data || err.message);
  }
}

testGemini();
