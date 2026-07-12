const { errorResponse } = require('../utils/response.util');

/**
 * Global error handler middleware.
 * Must be registered AFTER all routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, null, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found.', null, 404);
  }

  // Prisma foreign key constraint
  if (err.code === 'P2003') {
    return errorResponse(res, 'Related record not found.', null, 400);
  }

  // JWT errors (should be caught in middleware, fallback)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', null, 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired.', null, 401);
  }

  // Validation errors
  if (err.name === 'ZodError') {
    return errorResponse(res, 'Validation failed.', err.errors, 422);
  }

  // Default error handling
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // In production, only hide the message for actual server errors (5xx).
  // Client errors (4xx) should always show their real message.
  const isServerError = statusCode >= 500;
  const safeMessage = (process.env.NODE_ENV === 'production' && isServerError) ? 'Internal server error' : message;

  return errorResponse(
    res,
    safeMessage,
    (process.env.NODE_ENV === 'production' && isServerError) ? null : err,
    statusCode
  );
};

/**
 * 404 handler for unmatched routes.
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
