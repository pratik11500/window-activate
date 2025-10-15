const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

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
  
  // Get current time in HHMM format
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = hours + minutes;

  if (password === currentTime) {
    res.json({ key: process.env.ACTIVATION_KEY });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// For Vercel serverless: Export the app (don't call app.listen)
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  // Local dev
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
