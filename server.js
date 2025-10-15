const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load .env locally (Vercel uses env vars directly)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;

// In-memory feedback storage (for Vercel demo; use a DB in production)
let feedbackData = [];

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to validate password and return key
app.post('/get-key', (req, res) => {
  const { password } = req.body;
  
  // Validate against fixed password from .env
  if (password === process.env.PASSWORD) {
    res.json({ key: process.env.ACTIVATION_KEY });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// API endpoint to send feedback (in-memory for demo)
app.post('/send-feedback', (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    const timestamp = new Date().toISOString();
    const feedbackEntry = { timestamp, comment };

    // Add to in-memory array
    feedbackData.push(feedbackEntry);
    console.log('Feedback saved:', feedbackEntry); // Log for debugging

    res.json({ success: true, message: 'Feedback saved' });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// API endpoint to get feedback (protected by secret key)
app.get('/get-feedback', (req, res) => {
  const { secret } = req.query;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json(feedbackData);
});

// For Vercel serverless: Export the app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  // Local dev
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
