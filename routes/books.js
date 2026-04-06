const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('./users');
const router = express.Router();

const BOOKS_FILE = path.join(__dirname, '..', 'books.json');

// Helper function to read books from file
async function readBooks() {
  try {
    const data = await fs.readFile(BOOKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books file:', error);
    throw new Error('Unable to read books data');
  }
}

// Helper function to write books to file
async function writeBooks(books) {
  try {
    await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error writing books file:', error);
    throw new Error('Unable to write books data');
  }
}

// GET /books - Retrieve all books
router.get('/', async (req, res) => {
  try {
    const books = await readBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /books/isbn/:isbn - Get book(s) by ISBN
router.get('/isbn/:isbn', async (req, res) => {
  try {
    const books = await readBooks();
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ [isbn]: book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /books/author/:author - Get books by author
router.get('/author/:author', async (req, res) => {
  try {
    const books = await readBooks();
    const author = decodeURIComponent(req.params.author).toLowerCase();
    const filteredBooks = {};

    for (const [isbn, book] of Object.entries(books)) {
      if (book.author.toLowerCase().includes(author)) {
        filteredBooks[isbn] = book;
      }
    }

    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /books/title/:title - Get books by title
router.get('/title/:title', async (req, res) => {
  try {
    const books = await readBooks();
    const title = decodeURIComponent(req.params.title).toLowerCase();
    const filteredBooks = {};

    for (const [isbn, book] of Object.entries(books)) {
      if (book.title.toLowerCase().includes(title)) {
        filteredBooks[isbn] = book;
      }
    }

    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /books/review/:isbn - Get all reviews for a book
router.get('/review/:isbn', async (req, res) => {
  try {
    const books = await readBooks();
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ reviews: book.reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /books/review/:isbn - Add or update a review (authenticated)
router.put('/review/:isbn', authenticateToken, async (req, res) => {
  try {
    const books = await readBooks();
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!review) {
      return res.status(400).json({ message: 'Review is required' });
    }

    // Add or update the review
    books[isbn].reviews[username] = review;

    await writeBooks(books);
    res.json({ message: 'Review added/updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /books/review/:isbn - Delete a user's review (authenticated)
router.delete('/review/:isbn', authenticateToken, async (req, res) => {
  try {
    const books = await readBooks();
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    await writeBooks(books);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;