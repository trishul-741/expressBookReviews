const express = require('express');
const bodyParser = require('body-parser');
const booksRouter = require('./routes/books');
const { router: usersRouter } = require('./routes/users');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/books', booksRouter);
app.use('/', usersRouter); // Register and login are at root

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});