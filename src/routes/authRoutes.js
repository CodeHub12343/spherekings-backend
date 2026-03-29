/**
 * Authentication Routes
 * Defines all authentication endpoints
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordController,
} = require('../controllers/authController');

const {
  authenticateToken,
  authenticateRefreshToken,
} = require('../middlewares/authMiddleware');

const {
  checkAccountLockout,
  validateRegistration,
  sessionAuthLimiter,
  authLimiter,
  passwordResetLimiter,
} = require('../middlewares/securityMiddleware');

const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @POST /api/auth/register
 * Register a new user account
 * Body: { name, email, password, confirmPassword, role?, agreeToTerms }
 * Returns: { user, accessToken, refreshToken }
 */
router.post('/register', authLimiter, validateRegistration, asyncHandler(register));

/**
 * @POST /api/auth/login
 * Authenticate user and return JWT tokens
 * Body: { email, password, rememberMe? }
 * Returns: { user, accessToken, refreshToken }
 */
router.post('/login', authLimiter, checkAccountLockout, asyncHandler(login));

/**
 * @GET /api/auth/me
 * Get current authenticated user
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { user }
 * Uses sessionAuthLimiter (lenient) instead of strict authLimiter
 */
router.get('/me', sessionAuthLimiter, authenticateToken, asyncHandler(getCurrentUser));

/**
 * @POST /api/auth/refresh
 * Refresh access token using refresh token
 * Headers: Authorization: Bearer <refreshToken>
 * or Body: { refreshToken }
 * Returns: { user, newAccessToken }
 */
router.post('/refresh', authenticateRefreshToken, asyncHandler(refreshToken));

/**
 * @POST /api/auth/logout
 * Logout user (clear session/cookies)
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { success }
 */
router.post('/logout', authenticateToken, asyncHandler(logout));

/**
 * @PUT /api/auth/profile
 * Update user profile
 * Headers: Authorization: Bearer <accessToken>
 * Body: { name?, phoneNumber?, bio?, address? }
 * Returns: { user }
 */
router.put('/profile', authenticateToken, asyncHandler(updateProfile));

/**
 * @POST /api/auth/change-password
 * Change user password
 * Headers: Authorization: Bearer <accessToken>
 * Body: { currentPassword, newPassword, confirmPassword }
 * Returns: { success, message }
 */
router.post('/change-password', authenticateToken, asyncHandler(changePassword));

/**
 * @POST /api/auth/forgot-password
 * Request password reset email
 * Body: { email }
 * Returns: { success, message }
 * (Dev only: includes resetToken for testing)
 */
router.post('/forgot-password', passwordResetLimiter, asyncHandler(forgotPassword));

/**
 * @POST /api/auth/reset-password
 * Reset password using reset token from email
 * Body: { resetToken, newPassword, confirmPassword }
 * Returns: { success, message }
 */
router.post('/reset-password', passwordResetLimiter, asyncHandler(resetPasswordController));

module.exports = router;
