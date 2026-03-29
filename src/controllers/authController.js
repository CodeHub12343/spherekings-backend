/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 * Delegates business logic to authentication service
 */

const {
  registerUser,
  loginUser,
  getCurrentUserById,
  refreshAccessToken,
  updateUserProfile,
  changeUserPassword,
  requestPasswordReset,
  resetPassword,
} = require('../services/authService');

const { validate, registerSchema, loginSchema } = require('../validators/authValidator');

/**
 * @POST /api/auth/register
 * Register a new user account
 */
const register = async (req, res, next) => {
  try {
    // Validate input
    const validation = validate(registerSchema)(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Register user
    const result = await registerUser(validation.data);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
      },
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const validation = validate(loginSchema)(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Login user
    const result = await loginUser(validation.data.email, validation.data.password);

    // Set refresh token in secure httpOnly cookie if rememberMe is true
    if (validation.data.rememberMe) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
      },
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    // Log failed login attempt
    console.warn(`Failed login attempt for email: ${req.body.email}`);

    // Handle authentication errors (invalid email/password, account locked, etc.)
    if (error.message.includes('Invalid email or password') || 
        error.message.includes('Account is locked') ||
        error.message.includes('Account has been deactivated')) {
      return res.status(401).json({
        success: false,
        message: error.message,
        status: 401,
      });
    }

    // Pass other errors to error handler
    next(error);
  }
};

/**
 * @GET /api/auth/me
 * Get current authenticated user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is attached to request by auth middleware
    const userId = req.user.userId;

    const user = await getCurrentUserById(userId);

    res.status(200).json({
      success: true,
      message: 'Current user fetched successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/refresh
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await refreshAccessToken(userId);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
      },
      tokens: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/logout
 * Logout user (clear refresh token)
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token cookie if it exists
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @PUT /api/auth/profile
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const updatedUser = await updateUserProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/change-password
 * Change user password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const result = await changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/forgot-password
 * Request password reset
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await requestPasswordReset(email);

    // In a real application, send email here with reset link
    // Example: await sendPasswordResetEmail(email, result.resetToken)

    // For development, return the token (DO NOT DO THIS IN PRODUCTION)
    if (process.env.NODE_ENV === 'development') {
      result.resetToken = result.resetToken; // Safe in dev
    } else {
      delete result.resetToken; // Hide in production
    }

    res.status(200).json({
      success: true,
      message: result.message,
      // Only include for development
      ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @POST /api/auth/reset-password
 * Reset password with reset token
 */
const resetPasswordController = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const result = await resetPassword(resetToken, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordController,
};
