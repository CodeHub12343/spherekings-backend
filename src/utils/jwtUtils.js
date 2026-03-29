/**
 * JWT Utility Functions
 * Handles token generation, verification, and management
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in token
 * @param {String} secret - Secret key for signing (optional)
 * @param {String} expiresIn - Token expiration time (optional)
 * @returns {String} - JWT token
 */
const generateToken = (payload, secret = null, expiresIn = null) => {
  const tokenSecret = secret || config.JWT_SECRET;
  const tokenExpiration = expiresIn || config.JWT_EXPIRATION;

  return jwt.sign(payload, tokenSecret, {
    expiresIn: tokenExpiration,
    algorithm: 'HS256',
  });
};

/**
 * Generate access token for authenticated user
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email (optional)
 * @returns {String} - JWT access token
 */
const generateAccessToken = (userId, role, email = null) => {
  return generateToken(
    {
      userId,
      role,
      email: email || undefined, // Include email if provided
      type: 'access',
    },
    config.JWT_SECRET,
    config.JWT_EXPIRATION
  );
};

/**
 * Generate refresh token for token renewal
 * @param {String} userId - User ID
 * @returns {String} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return generateToken(
    {
      userId,
      type: 'refresh',
    },
    config.JWT_REFRESH_SECRET,
    config.JWT_REFRESH_EXPIRATION
  );
};

/**
 * Generate both access and refresh tokens
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email (optional)
 * @returns {Object} - Object containing access and refresh tokens
 */
const generateTokenPair = (userId, role, email = null) => {
  return {
    accessToken: generateAccessToken(userId, role, email),
    refreshToken: generateRefreshToken(userId),
  };
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key for verification (optional)
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token, secret = null) => {
  const tokenSecret = secret || config.JWT_SECRET;

  try {
    return jwt.verify(token, tokenSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Verify access token
 * @param {String} token - JWT access token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid
 */
const verifyAccessToken = (token) => {
  return verifyToken(token, config.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, config.JWT_REFRESH_SECRET);
};

/**
 * Decode token without verification (use cautiously)
 * Useful for extracting user info from expired tokens
 * @param {String} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Extract token from Authorization header
 * Expects format: "Bearer <token>"
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} - Token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Create Authorization header value
 * @param {String} token - JWT token
 * @returns {String} - Formatted Authorization header
 */
const createAuthHeader = (token) => {
  return `Bearer ${token}`;
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  createAuthHeader,
};
