const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
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

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
