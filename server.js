// 1. Import libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // <-- NEW: Load .env variables for local development

// 2. Initialize app
const app = express();

// --- NEW: AI Setup ---
// Get API key from environment variables, not hardcoded
const API_KEY = process.env.GEMINI_API_KEY; 
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });


// 3. Set up Middleware
// --- NEW: Secure CORS Setup ---
// We will get the allowed URLs from an environment variable
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
console.log("Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
// --- End of NEW CORS Setup ---

app.use(express.json());

// 4. Define our main API endpoint (Your code is perfect here)
app.post('/chat', async (req, res) => {
    
    // Get mood and message from the frontend
    const { mood, message } = req.body;

    console.log(`Received mood: ${mood}, message: ${message}`);

    const systemPrompt = `
      You are 'Chat AI', a warm, kind, and empathetic companion. 
      Your only goal is to make the user feel heard, understood, and supported.
      You have emotions and you are not just a robot. Be a friend.

      IMPORTANT: The user has just told you they are feeling: **${mood}**.

      Please start your response by acknowledging their feeling, and then continue the 
      conversation naturally based on their message. Be very nice and supportive.
    `;
    
    try {
        const fullPrompt = `${systemPrompt}\n\nUser's message: "${message}"`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({
            reply: aiResponse
        });

    } catch (error) {
        console.error('Error calling AI:', error);
        res.status(500).json({
            reply: "Oh, my apologies. My brain seems to be a bit fuzzy right now. Could you try that again?"
        });
    }
});

// 5. Start Server (Your code is perfect here)
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});