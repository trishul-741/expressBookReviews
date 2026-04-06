const axios = require('axios');

// Base URL for the API (assuming server runs on localhost:3000)
const BASE_URL = 'http://localhost:3000';

/**
 * Function to get all books
 * @returns {Object} Object containing all books
 * @throws {Error} If request fails or no books are found
 */
async function getAllBooks() {
  try {
    // Validate base URL
    if (!BASE_URL) {
      throw new Error('Base URL is not configured');
    }

    const response = await axios.get(`${BASE_URL}/books`);

    // Check if response status is successful
    if (response.status === 200) {
      // Validate response data
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn('No books found in the library');
        return {
          success: true,
          status: 'empty',
          message: 'No books currently available',
          data: {}
        };
      }

      return {
        success: true,
        status: 'success',
        message: 'Books retrieved successfully',
        data: response.data,
        count: Object.keys(response.data).length
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error(`Error fetching all books: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Error fetching all books: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } else {
      // Error in request setup
      console.error('Error fetching all books:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Function to get books by ISBN
 * @param {string} isbn - The ISBN of the book to retrieve
 * @returns {Object} Object containing the book details
 * @throws {Error} If ISBN is invalid or book not found
 */
async function getBooksByISBN(isbn) {
  try {
    // Validate ISBN parameter
    if (!isbn || typeof isbn !== 'string') {
      throw new Error('ISBN is required and must be a valid string');
    }

    const trimmedISBN = isbn.trim();
    if (trimmedISBN.length === 0) {
      throw new Error('ISBN cannot be empty');
    }

    const response = await axios.get(`${BASE_URL}/books/isbn/${trimmedISBN}`);

    if (response.status === 200) {
      return {
        success: true,
        status: 'success',
        message: 'Book retrieved successfully',
        data: response.data
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.warn(`Book not found for ISBN: ${isbn}`);
        return {
          success: false,
          status: 'not_found',
          message: `No book found with ISBN: ${isbn}`,
          data: null
        };
      }
      console.error(`Error fetching books by ISBN: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('Error fetching books by ISBN: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } else if (error.message.includes('ISBN')) {
      // Re-throw validation errors
      throw error;
    } else {
      console.error('Error fetching books by ISBN:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Function to get books by author
 * @param {string} author - The author name to search for
 * @returns {Object} Object containing matching books
 * @throws {Error} If author parameter is invalid
 */
async function getBooksByAuthor(author) {
  try {
    // Validate author parameter
    if (!author || typeof author !== 'string') {
      throw new Error('Author name is required and must be a valid string');
    }

    const trimmedAuthor = author.trim();
    if (trimmedAuthor.length === 0) {
      throw new Error('Author name cannot be empty');
    }

    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(trimmedAuthor)}`);

    if (response.status === 200) {
      // Check if any books were found
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn(`No books found for author: ${author}`);
        return {
          success: false,
          status: 'not_found',
          message: `No books found for author: ${author}`,
          data: {},
          count: 0
        };
      }

      return {
        success: true,
        status: 'success',
        message: `Books by author "${author}" retrieved successfully`,
        data: response.data,
        count: Object.keys(response.data).length
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error(`Error fetching books by author: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('Error fetching books by author: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } else if (error.message.includes('Author')) {
      // Re-throw validation errors
      throw error;
    } else {
      console.error('Error fetching books by author:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Function to get books by title
 * @param {string} title - The title to search for
 * @returns {Object} Object containing matching books
 * @throws {Error} If title parameter is invalid
 */
async function getBooksByTitle(title) {
  try {
    // Validate title parameter
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a valid string');
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Title cannot be empty');
    }

    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(trimmedTitle)}`);

    if (response.status === 200) {
      // Check if any books were found
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn(`No books found with title: ${title}`);
        return {
          success: false,
          status: 'not_found',
          message: `No books found with title: ${title}`,
          data: {},
          count: 0
        };
      }

      return {
        success: true,
        status: 'success',
        message: `Books with title "${title}" retrieved successfully`,
        data: response.data,
        count: Object.keys(response.data).length
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error(`Error fetching books by title: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('Error fetching books by title: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } else if (error.message.includes('Title')) {
      // Re-throw validation errors
      throw error;
    } else {
      console.error('Error fetching books by title:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

module.exports = {
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
};