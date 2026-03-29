/**
 * Authentication Middleware
 * Verifies JWT tokens and manages user context
 */

const { verifyAccessToken, verifyRefreshToken, extractTokenFromHeader } = require('../utils/jwtUtils');

/**
 * Middleware: Verify JWT access token
 * Attaches user info to req.user
 * Requires "Authorization: Bearer <token>" header
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please provide valid credentials.',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    // Attach user info to request
    req.user = {
      _id: decoded.userId,
      id: decoded.userId,      // For compatibility
      userId: decoded.userId,  // For compatibility
      email: decoded.email,    // Include email from token
      role: decoded.role,
    };

    console.log('🔐 [AUTH] User authenticated:', {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role,
      userIdType: typeof req.user._id,
    });

    next();
  } catch (error) {
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed token',
    });
  }
};

/**
 * Middleware: Verify JWT refresh token
 * Used for token refresh endpoints
 */
const authenticateRefreshToken = (req, res, next) => {
  try {
    // Extract token from Authorization header or body
    let token = extractTokenFromHeader(req.headers.authorization);

    if (!token && req.body.refreshToken) {
      token = req.body.refreshToken;
    }

    // Check cookie as fallback
    if (!token && req.cookies && req.cookies.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Check token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

/**
 * Middleware: Optional authentication
 * Attaches user if token is valid, but doesn't reject if missing
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);

      if (decoded.type === 'access') {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
      }
    }

    // Continue regardless of token validity
    next();
  } catch (error) {
    // Continue without user context
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticate: authenticateToken, // Alias for convenience
  authenticateRefreshToken,
  optionalAuth,
};
