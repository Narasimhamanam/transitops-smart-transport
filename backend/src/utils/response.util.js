/**
 * Sends a standardized success response.
 * @param {object} res - Express response object
 * @param {*} data - Response data payload
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {*} error - Error details (omitted in production)
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && error) {
    response.error = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  }

  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
