const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises; // Use promises API for async file operations

// Load .env locally (Vercel uses env vars directly)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;

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

// API endpoint to send feedback (stored in feedback.json)
app.post('/send-feedback', async (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    const timestamp = new Date().toISOString();
    const feedbackEntry = { timestamp, comment };

    // Read existing feedback or initialize empty array
    let feedbackData = [];
    try {
      const fileContent = await fs.readFile('feedback.json', 'utf8');
      feedbackData = JSON.parse(fileContent);
      if (!Array.isArray(feedbackData)) feedbackData = [];
    } catch (e) {
      // File doesn't exist yet, proceed with empty array
    }

    // Append new feedback
    feedbackData.push(feedbackEntry);
    await fs.writeFile('feedback.json', JSON.stringify(feedbackData, null, 2));

    res.json({ success: true, message: 'Feedback saved' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// API endpoint to get feedback (protected by secret key)
app.get('/get-feedback', (req, res) => {
  const { secret } = req.query;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const feedbackData = JSON.parse(fs.readFileSync('feedback.json', 'utf8') || '[]');
    res.json(feedbackData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
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
