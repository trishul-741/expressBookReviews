const axios = require('axios');

// Base URL for the API (assuming server runs on localhost:3000)
const BASE_URL = 'http://localhost:3000';

// Function to get all books
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error.message);
    throw error;
  }
}

// Function to get books by ISBN
async function getBooksByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/books/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by ISBN:', error.message);
    throw error;
  }
}

// Function to get books by author
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by author:', error.message);
    throw error;
  }
}

// Function to get books by title
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by title:', error.message);
    throw error;
  }
}

module.exports = {
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
};