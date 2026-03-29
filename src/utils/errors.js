/**
 * Custom Error Classes for API Error Handling
 * Provides standardized error responses across the entire application
 */

/**
 * Base API Error Class
 * All custom errors should extend this class for consistent error handling
 */
class APIError extends Error {
  constructor(message, statusCode, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      errors: Object.keys(this.errors).length > 0 ? this.errors : undefined,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation Error - 400 Bad Request
 * Used when incoming request data fails validation
 */
class ValidationError extends APIError {
  constructor(message, errors = {}) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error - 404
 * Used when a requested resource doesn't exist
 */
class NotFoundError extends APIError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized Error - 401
 * Used when authentication is required but missing/invalid
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error - 403
 * Used when user lacks required permissions
 */
class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict Error - 409
 * Used when request conflicts with existing data (e.g., duplicate unique field)
 */
class ConflictError extends APIError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Server Error - 500
 * Used for unexpected server-side errors
 */
class ServerError extends APIError {
  constructor(message = 'Internal server error', originalError = null) {
    super(message, 500);
    this.name = 'ServerError';
    if (originalError) {
      this.originalError = originalError;
      console.error('Server Error:', originalError);
    }
  }
}

module.exports = {
  APIError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServerError
};
