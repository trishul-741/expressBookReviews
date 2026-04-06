const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory storage for users (for simplicity, in production use a database)
const users = {};

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// POST /register - Register a new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (users[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Store user (in production, hash the password)
  users[username] = { password };

  res.status(201).json({ message: 'User registered successfully' });
});

// POST /login - Authenticate user
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

module.exports = { router, authenticateToken };