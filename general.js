/**
 * General.js - Book Retrieval Module
 * 
 * This module provides utility functions to retrieve book information from the Express Book Reviews API.
 * It handles all HTTP requests to fetch books by various criteria (ISBN, author, title, or all books).
 * 
 * Features:
 * - Comprehensive parameter validation for all input data
 * - Detailed error handling for server errors, connection failures, and invalid inputs
 * - Structured response objects with success indicators and detailed messages
 * - Proper logging for debugging and monitoring
 * - URL encoding for special characters in search parameters
 * 
 * Dependencies:
 * - axios: HTTP client library for making API requests
 * 
 * Usage Example:
 *   const { getBooksByAuthor } = require('./general');
 *   try {
 *     const result = await getBooksByAuthor('J.K. Rowling');
 *     if (result.success) {
 *       console.log(`Found ${result.count} books`);
 *     }
 *   } catch (error) {
 *     console.error('Failed to retrieve books:', error.message);
 *   }
 */

const axios = require('axios');

// Base URL for the API (assumes server is running on localhost:3000)
// Update this URL if the server is hosted on a different domain or port
const BASE_URL = 'http://localhost:3000';

/**
 * Retrieve all books from the library
 * 
 * Fetches the complete list of all available books in the database.
 * This function does not require any parameters.
 * 
 * @returns {Object} Response object with the following structure:
 *   - success {boolean}: Indicates whether the operation was successful
 *   - status {string}: Status type - 'success' or 'empty'
 *   - message {string}: Human-readable description of the response
 *   - data {Object}: Dictionary of all books, indexed by ISBN
 *   - count {number}: Total number of books retrieved
 * 
 * @returns {Object} Example Success Response:
 *   {
 *     success: true,
 *     status: 'success',
 *     message: 'Books retrieved successfully',
 *     data: { '978-0-7432-7356-5': { title: '...', author: '...', ... }, ... },
 *     count: 10
 *   }
 * 
 * @returns {Object} Example Empty Response:
 *   {
 *     success: true,
 *     status: 'empty',
 *     message: 'No books currently available',
 *     data: {},
 *     count: 0
 *   }
 * 
 * @throws {Error} If BASE_URL is not configured or if server connection fails
 *   Error scenarios:
 *   - Base URL not configured
 *   - Server returns error status code
 *   - Unable to connect to the server
 * 
 * Error Handling:
 * - Validates configuration before making requests
 * - Handles server errors (5xx, 4xx responses)
 * - Handles network errors (connection failures)
 * - Handles empty result sets gracefully
 */
async function getAllBooks() {
  try {
    // Validate base URL is configured before making the request
    if (!BASE_URL) {
      throw new Error('Base URL is not configured');
    }

    // Make asynchronous GET request to retrieve all books endpoint
    const response = await axios.get(`${BASE_URL}/books`);

    // Check if response status indicates successful request (200 OK)
    if (response.status === 200) {
      // Validate that response contains data and books exist in the library
      if (!response.data || Object.keys(response.data).length === 0) {
        // Return success response with empty status when no books are found
        console.warn('No books found in the library');
        return {
          success: true,
          status: 'empty',
          message: 'No books currently available',
          data: {}
        };
      }

      // Return success response with all books and count
      return {
        success: true,
        status: 'success',
        message: 'Books retrieved successfully',
        data: response.data,
        count: Object.keys(response.data).length  // Calculate number of books
      };
    }
  } catch (error) {
    // Handle server response errors (4xx, 5xx status codes)
    if (error.response) {
      console.error(`Error fetching all books: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } 
    // Handle network errors (request made but no response received)
    else if (error.request) {
      console.error('Error fetching all books: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } 
    // Handle request configuration errors
    else {
      console.error('Error fetching all books:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Retrieve a specific book by its ISBN (International Standard Book Number)
 * 
 * Fetches book details using the ISBN as a unique identifier.
 * ISBN is case-insensitive and whitespace will be trimmed from the input.
 * 
 * @param {string} isbn - The ISBN of the book to retrieve
 *   Format: Any valid ISBN string (e.g., '978-0-7432-7356-5' or '9780743273565')
 *   Required: Yes
 *   Must not be empty or whitespace-only
 * 
 * @returns {Object} Response object with the following structure:
 *   - success {boolean}: Indicates whether the operation was successful
 *   - status {string}: Status type - 'success' or 'not_found'
 *   - message {string}: Human-readable description of the response
 *   - data {Object|null}: Book details if found, null if not found
 * 
 * @returns {Object} Example Success Response:
 *   {
 *     success: true,
 *     status: 'success',
 *     message: 'Book retrieved successfully',
 *     data: { '978-0-7432-7356-5': { title: '...', author: '...', reviews: {...} } }
 *   }
 * 
 * @returns {Object} Example Not Found Response:
 *   {
 *     success: false,
 *     status: 'not_found',
 *     message: 'No book found with ISBN: 978-0000000000',
 *     data: null
 *   }
 * 
 * @throws {Error} If ISBN parameter is invalid or missing
 *   Error scenarios:
 *   - ISBN is not provided
 *   - ISBN is not a string type
 *   - ISBN is empty or contains only whitespace
 *   - Server connection fails
 *   - Server returns unexpected error
 * 
 * Parameter Validation:
 * - Checks that ISBN is provided and is a string
 * - Trims whitespace from both ends of the ISBN
 * - Ensures ISBN is not empty after trimming
 * 
 * Error Handling:
 * - Returns 'not_found' status for 404 responses (book doesn't exist)
 * - Throws error for other server errors (5xx, other 4xx responses)
 * - Handles network connection failures
 * - Re-throws validation errors with descriptive messages
 */
async function getBooksByISBN(isbn) {
  try {
    // Validate that ISBN parameter is provided and is a string
    if (!isbn || typeof isbn !== 'string') {
      throw new Error('ISBN is required and must be a valid string');
    }

    // Trim whitespace from ISBN and validate it's not empty
    const trimmedISBN = isbn.trim();
    if (trimmedISBN.length === 0) {
      throw new Error('ISBN cannot be empty');
    }

    // Make API request to fetch book by ISBN
    // ISBN is not URL-encoded as it typically doesn't contain special characters
    const response = await axios.get(`${BASE_URL}/books/isbn/${trimmedISBN}`);

    // Process successful response (200 OK)
    if (response.status === 200) {
      return {
        success: true,
        status: 'success',
        message: 'Book retrieved successfully',
        data: response.data
      };
    }
  } catch (error) {
    // Handle different types of errors with appropriate responses
    if (error.response) {
      // Handle HTTP error responses from server
      if (error.response.status === 404) {
        // Book not found - return structured not_found response
        console.warn(`Book not found for ISBN: ${isbn}`);
        return {
          success: false,
          status: 'not_found',
          message: `No book found with ISBN: ${isbn}`,
          data: null
        };
      }
      // Other server errors (5xx, other 4xx)
      console.error(`Error fetching books by ISBN: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } 
    // Handle network errors (connection issues)
    else if (error.request) {
      console.error('Error fetching books by ISBN: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } 
    // Handle parameter validation errors
    else if (error.message.includes('ISBN')) {
      // Re-throw validation errors with original message
      throw error;
    } 
    // Handle other unexpected errors
    else {
      console.error('Error fetching books by ISBN:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Retrieve all books by a specific author
 * 
 * Searches the database for books written by the specified author.
 * The search is case-insensitive and uses partial matching (e.g., "Rowling" will match "J.K. Rowling").
 * Special characters in author names are automatically URL-encoded.
 * 
 * @param {string} author - The name of the author to search for
 *   Format: Author's full name or partial name (e.g., 'J.K. Rowling', 'Rowling', 'J K')
 *   Required: Yes
 *   Must not be empty or whitespace-only
 * 
 * @returns {Object} Response object with the following structure:
 *   - success {boolean}: Indicates whether the operation was successful
 *   - status {string}: Status type - 'success' or 'not_found'
 *   - message {string}: Human-readable description of the response
 *   - data {Object}: Dictionary of matching books, indexed by ISBN (empty if none found)
 *   - count {number}: Total number of books found for this author
 * 
 * @returns {Object} Example Success Response:
 *   {
 *     success: true,
 *     status: 'success',
 *     message: 'Books by author "J.K. Rowling" retrieved successfully',
 *     data: {
 *       '978-0-7475-3269-9': { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', ... },
 *       '978-0-7475-3965-9': { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', ... }
 *     },
 *     count: 2
 *   }
 * 
 * @returns {Object} Example Not Found Response:
 *   {
 *     success: false,
 *     status: 'not_found',
 *     message: 'No books found for author: Unknown Author',
 *     data: {},
 *     count: 0
 *   }
 * 
 * @throws {Error} If author parameter is invalid or missing
 *   Error scenarios:
 *   - Author name is not provided
 *   - Author is not a string type
 *   - Author is empty or contains only whitespace
 *   - Server connection fails
 *   - Server returns unexpected error
 * 
 * Parameter Validation:
 * - Checks that author is provided and is a string
 * - Trims whitespace from both ends of the author name
 * - Ensures author name is not empty after trimming
 * - URL-encodes the author name for safe transmission
 * 
 * Search Behavior:
 * - Search is case-insensitive
 * - Partial matching is supported (substring search)
 * - Returns all matching books with their ISBNs
 * - Returns count of matching books for easy reference
 * 
 * Error Handling:
 * - Returns 'not_found' status when no books match the author (not an error condition)
 * - Throws error for server connection failures
 * - Throws error for unexpected server errors
 * - Re-throws validation errors with descriptive messages
 */
async function getBooksByAuthor(author) {
  try {
    // Validate that author parameter is provided and is a string
    if (!author || typeof author !== 'string') {
      throw new Error('Author name is required and must be a valid string');
    }

    // Trim whitespace from author name and validate it's not empty
    const trimmedAuthor = author.trim();
    if (trimmedAuthor.length === 0) {
      throw new Error('Author name cannot be empty');
    }

    // Make API request to search for books by author
    // Author name is URL-encoded to handle special characters (spaces, accents, etc.)
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(trimmedAuthor)}`);

    // Process successful response (200 OK)
    if (response.status === 200) {
      // Check if any books were found matching the author criteria
      if (!response.data || Object.keys(response.data).length === 0) {
        // No books found - return not_found status (not an error)
        console.warn(`No books found for author: ${author}`);
        return {
          success: false,
          status: 'not_found',
          message: `No books found for author: ${author}`,
          data: {},
          count: 0
        };
      }

      // Books found - return success response with all matching books
      return {
        success: true,
        status: 'success',
        message: `Books by author "${author}" retrieved successfully`,
        data: response.data,
        count: Object.keys(response.data).length  // Calculate number of matching books
      };
    }
  } catch (error) {
    // Handle different types of errors with appropriate responses
    if (error.response) {
      // Handle HTTP error responses from server
      console.error(`Error fetching books by author: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } 
    // Handle network errors (connection issues)
    else if (error.request) {
      console.error('Error fetching books by author: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } 
    // Handle parameter validation errors
    else if (error.message.includes('Author')) {
      // Re-throw validation errors with original message
      throw error;
    } 
    // Handle other unexpected errors
    else {
      console.error('Error fetching books by author:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Retrieve all books by a specific title or partial title match
 * 
 * Searches the database for books matching the specified title.
 * The search is case-insensitive and uses partial matching (e.g., "Harry" will match "Harry Potter and the Philosopher's Stone").
 * Special characters in titles are automatically URL-encoded.
 * 
 * @param {string} title - The title of the book(s) to search for
 *   Format: Full title or partial title (e.g., 'Harry Potter', 'Harry', 'The Hobbit')
 *   Required: Yes
 *   Must not be empty or whitespace-only
 * 
 * @returns {Object} Response object with the following structure:
 *   - success {boolean}: Indicates whether the operation was successful
 *   - status {string}: Status type - 'success' or 'not_found'
 *   - message {string}: Human-readable description of the response
 *   - data {Object}: Dictionary of matching books, indexed by ISBN (empty if none found)
 *   - count {number}: Total number of books found with this title
 * 
 * @returns {Object} Example Success Response:
 *   {
 *     success: true,
 *     status: 'success',
 *     message: 'Books with title "Harry Potter" retrieved successfully',
 *     data: {
 *       '978-0-7475-3269-9': { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', ... },
 *       '978-0-7475-3965-9': { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', ... }
 *     },
 *     count: 2
 *   }
 * 
 * @returns {Object} Example Not Found Response:
 *   {
 *     success: false,
 *     status: 'not_found',
 *     message: 'No books found with title: Non-existent Book',
 *     data: {},
 *     count: 0
 *   }
 * 
 * @throws {Error} If title parameter is invalid or missing
 *   Error scenarios:
 *   - Title is not provided
 *   - Title is not a string type
 *   - Title is empty or contains only whitespace
 *   - Server connection fails
 *   - Server returns unexpected error
 * 
 * Parameter Validation:
 * - Checks that title is provided and is a string
 * - Trims whitespace from both ends of the title
 * - Ensures title is not empty after trimming
 * - URL-encodes the title for safe transmission
 * 
 * Search Behavior:
 * - Search is case-insensitive (e.g., "harry" matches "Harry Potter")
 * - Partial matching is supported (substring search)
 * - Useful for finding books when you don't remember the exact title
 * - Returns all matching books with their ISBNs and details
 * - Returns count of matching books for easy reference
 * 
 * Error Handling:
 * - Returns 'not_found' status when no books match the title (not an error condition)
 * - Throws error for server connection failures
 * - Throws error for unexpected server errors
 * - Re-throws validation errors with descriptive messages
 */
async function getBooksByTitle(title) {
  try {
    // Validate that title parameter is provided and is a string
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a valid string');
    }

    // Trim whitespace from title and validate it's not empty
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Title cannot be empty');
    }

    // Make API request to search for books by title
    // Title is URL-encoded to handle special characters (apostrophes, colons, etc.)
    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(trimmedTitle)}`);

    // Process successful response (200 OK)
    if (response.status === 200) {
      // Check if any books were found matching the title criteria
      if (!response.data || Object.keys(response.data).length === 0) {
        // No books found - return not_found status (not an error)
        console.warn(`No books found with title: ${title}`);
        return {
          success: false,
          status: 'not_found',
          message: `No books found with title: ${title}`,
          data: {},
          count: 0
        };
      }

      // Books found - return success response with all matching books
      return {
        success: true,
        status: 'success',
        message: `Books with title "${title}" retrieved successfully`,
        data: response.data,
        count: Object.keys(response.data).length  // Calculate number of matching books
      };
    }
  } catch (error) {
    // Handle different types of errors with appropriate responses
    if (error.response) {
      // Handle HTTP error responses from server
      console.error(`Error fetching books by title: Status ${error.response.status}`, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } 
    // Handle network errors (connection issues)
    else if (error.request) {
      console.error('Error fetching books by title: No response from server', error.message);
      throw new Error('Unable to connect to server. Please ensure the server is running.');
    } 
    // Handle parameter validation errors
    else if (error.message.includes('Title')) {
      // Re-throw validation errors with original message
      throw error;
    } 
    // Handle other unexpected errors
    else {
      console.error('Error fetching books by title:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Module Exports
 * 
 * Export all public functions for use in other modules.
 * These functions can be imported and used as follows:
 * 
 * const { getBooksByAuthor, getBooksByTitle, getBooksByISBN, getAllBooks } = require('./general');
 */
module.exports = {
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
};