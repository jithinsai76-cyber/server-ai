// [UPDATED] - server.js

// 1. Import libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); 

// 2. Initialize app
const app = express();

// --- AI Setup ---
const API_KEY = process.env.GEMINI_API_KEY; 
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // Using 1.5-flash as it's common

// 3. Set up Middleware

// --- *** THIS IS THE FIRST FIX *** ---
// This simple setup is BEST for local development.
// It allows requests from *any* origin (like localhost:5173, etc.)
// Your Render server will use environment variables for security.
app.use(cors()); 
// --- *** END OF FIRST FIX *** ---

app.use(express.json()); // This is perfect

// ...
app.use(cors()); 
app.use(express.json()); // This line is CRITICAL

// ...
app.use(cors()); 
app.use(express.json()); // This line is CRITICAL

// 4. Define our main API endpoint
app.post('/chat', async (req, res) => {
    
    // THIS LINE IS CRASHING
    const { message } = req.body; 
    // ...

    console.log(`Received message: ${message}`);

    // We remove the 'mood' part from the prompt, as it was 'undefined'.
    const systemPrompt = `
      You are 'Chat AI', a warm, kind, and empathetic companion. 
      Your only goal is to make the user feel heard, understood, and supported.
      You have emotions and you are not just a robot. Be a friend.
      
      Continue the conversation naturally based on their message. 
      Be very nice and supportive.
    `;
    // --- *** END OF SECOND FIX *** ---
    
    try {
        // You can simplify the prompt like this:
        const fullPrompt = `${systemPrompt}\n\nUser: "${message}"\nAI Friend:`

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const aiResponse = response.text();

        // This is perfect
        res.json({
            reply: aiResponse
        });

    } catch (error) {
        console.error('Error calling AI:', error);
        // This error handling is excellent! It sends back valid JSON.
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

