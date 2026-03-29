/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

/**
 * API Error class
 * Standardized error format with status codes
 */
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware: Global error handler
 * Should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error('❌ Error:', err);
  }

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Only show error details in development
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        message: err.message,
        stack: err.stack,
      },
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * Middleware: Catch undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * Usage: router.get('/path', asyncHandler(controllerFunction))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
