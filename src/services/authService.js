/**
 * Authentication Service
 * Business logic for authentication operations
 * This service handles the core authentication workflows
 */

const User = require('../models/User');
const {
  generateTokenPair,
  generateAccessToken,
} = require('../utils/jwtUtils');
const {
  comparePasswords,
  validatePasswordStrength,
  generateResetToken,
} = require('../utils/passwordUtils');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User object and tokens
 * @throws {Error} - If validation fails
 */
const registerUser = async (userData) => {
  const { name, email, password, role = 'customer' } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered. Please use a different email.');
  }

  // Validate password strength
  const passwordStrength = validatePasswordStrength(password);
  if (!passwordStrength.isValid) {
    throw new Error(
      `Password is too weak. Requirements: ${passwordStrength.feedback.join(', ')}`
    );
  }

  // Generate affiliate code if registering as affiliate
  // Note: Affiliate code is now generated only in affiliateService.registerAffiliate
  // when user explicitly registers as an affiliate
  let affiliateCode = null;
  if (role === 'affiliate') {
    console.warn('Role set to affiliate during user registration. This should only happen during affiliate registration.');
  }

  // Create new user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase(),
    password, // Will be hashed by mongoose middleware
    role,
    // affiliateCode is not set here - only set when registering as affiliate
    isEmailVerified: false, // Set to true after email verification
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(
    user._id.toString(),
    user.role,
    user.email
  );

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Authenticate user with email and password
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Promise<Object>} - User object and tokens
 * @throws {Error} - If authentication fails
 */
const loginUser = async (email, password) => {
  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password +loginAttempts +lockUntil'
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new Error('Account is locked. Please try again later.');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account has been deactivated');
  }

  // Verify password
  const isPasswordMatch = await comparePasswords(password, user.password);

  if (!isPasswordMatch) {
    // Increment failed login attempts
    await user.incLoginAttempts();
    throw new Error('Invalid email or password');
  }

  // Reset login attempts on successful login
  await user.updateLastLogin();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(
    user._id.toString(),
    user.role,
    user.email
  );

  const userData = user.toJSON();

  // If user is an affiliate, include their affiliate ID
  if (user.affiliateStatus === 'active') {
    const Affiliate = require('../models/Affiliate');
    const affiliate = await Affiliate.findOne({ userId: user._id }).select('_id affiliateCode');
    if (affiliate) {
      userData.affiliateId = affiliate._id.toString();
      userData.affiliateCode = affiliate.affiliateCode;
    }
  }

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

/**
 * Get current user by ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - User object
 * @throws {Error} - If user not found
 */
const getCurrentUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new Error('User not found or account is inactive');
  }

  const userData = user.toJSON();

  // If user is an affiliate, include their affiliate details and balance
  if (user.affiliateStatus === 'active') {
    const Affiliate = require('../models/Affiliate');
    const Commission = require('../models/Commission');
    
    const affiliate = await Affiliate.findOne({ userId: user._id }).select(
      '_id affiliateCode status totalEarnings commissionRate'
    );
    
    if (affiliate) {
      userData.affiliateId = affiliate._id.toString();
      userData.affiliateCode = affiliate.affiliateCode;
      
      // Calculate pending and approved earnings from Commission records
      const pendingCommissions = await Commission.find({
        affiliateId: affiliate._id,
        status: 'pending'
      }).select('calculation.amount');
      
      const approvedCommissions = await Commission.find({
        affiliateId: affiliate._id,
        status: 'approved'
      }).select('calculation.amount');
      
      const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
      const approvedEarnings = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
      
      // Available balance = ONLY approved (pending is not yet approved for payout)
      const availableBalance = approvedEarnings;
      
      console.log(`✅ [AUTH] Affiliate ${affiliate._id} balance:`, {
        available: availableBalance,
        pending: pendingEarnings,
        approved: approvedEarnings,
      });
      
      // Include affiliate details for frontend
      userData.affiliateDetails = {
        affiliateId: affiliate._id.toString(),
        status: affiliate.status,
        availableBalance: Math.round(availableBalance * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        approvedEarnings: Math.round(approvedEarnings * 100) / 100,
        totalEarnings: affiliate.totalEarnings || 0,
        commissionRate: affiliate.commissionRate || 10,
      };
    }
  }

  return userData;
};

/**
 * Refresh access token using refresh token
 * @param {String} userId - User ID from refresh token
 * @returns {Promise<Object>} - New access token
 * @throws {Error} - If user not found
 */
const refreshAccessToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new Error('User not found or account is inactive');
  }

  // Generate new access token
  const accessToken = generateAccessToken(user._id.toString(), user.role, user.email);

  const userData = user.toJSON();

  // If user is an affiliate, include their affiliate details and balance
  if (user.affiliateStatus === 'active') {
    const Affiliate = require('../models/Affiliate');
    const Commission = require('../models/Commission');
    
    const affiliate = await Affiliate.findOne({ userId: user._id }).select(
      '_id affiliateCode status totalEarnings commissionRate'
    );
    
    if (affiliate) {
      userData.affiliateId = affiliate._id.toString();
      userData.affiliateCode = affiliate.affiliateCode;
      
      // Calculate pending and approved earnings from Commission records
      const pendingCommissions = await Commission.find({
        affiliateId: affiliate._id,
        status: 'pending'
      }).select('calculation.amount');
      
      const approvedCommissions = await Commission.find({
        affiliateId: affiliate._id,
        status: 'approved'
      }).select('calculation.amount');
      
      const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
      const approvedEarnings = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
      
      // Available balance = ONLY approved (pending is not yet approved for payout)
      const availableBalance = approvedEarnings;
      
      console.log(`✅ [AUTH-REFRESH] Affiliate ${affiliate._id} balance:`, {
        available: availableBalance,
        pending: pendingEarnings,
        approved: approvedEarnings,
      });
      
      // Include affiliate details for frontend
      userData.affiliateDetails = {
        affiliateId: affiliate._id.toString(),
        status: affiliate.status,
        availableBalance: Math.round(availableBalance * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        approvedEarnings: Math.round(approvedEarnings * 100) / 100,
        totalEarnings: affiliate.totalEarnings || 0,
        commissionRate: affiliate.commissionRate || 10,
      };
    }
  }

  return {
    accessToken,
    user: userData,
  };
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user object
 * @throws {Error} - If update fails
 */
const updateUserProfile = async (userId, updateData) => {
  // Allowed fields to update
  const allowedFields = ['name', 'phoneNumber', 'bio', 'address', 'profileImage'];

  // Filter and validate update data
  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData.hasOwnProperty(field)) {
      updates[field] = updateData[field];
    }
  });

  // Find and update user
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.toJSON();
};

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<Object>} - Success message
 * @throws {Error} - If password change fails
 */
const changeUserPassword = async (userId, currentPassword, newPassword) => {
  // Get user with password field
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordMatch = await comparePasswords(
    currentPassword,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password strength
  const passwordStrength = validatePasswordStrength(newPassword);
  if (!passwordStrength.isValid) {
    throw new Error(
      `New password is too weak. Requirements: ${passwordStrength.feedback.join(', ')}`
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: 'Password changed successfully',
  };
};

/**
 * Request password reset
 * @param {String} email - User email
 * @returns {Promise<Object>} - Reset token (to be sent via email)
 * @throws {Error} - If user not found
 */
const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists or not for security
    return {
      success: true,
      message: 'If the email exists, password reset link has been sent',
    };
  }

  // Generate reset token
  const resetToken = generateResetToken();

  // Hash the token for storage
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set reset token and expiration (24 hours)
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  // Return unhashed token to send in email
  return {
    resetToken, // This should be sent in email link
    expiresIn: '24 hours',
  };
};

/**
 * Reset password using reset token
 * @param {String} resetToken - Reset token from email
 * @param {String} newPassword - New password
 * @returns {Promise<Object>} - Success message
 * @throws {Error} - If reset fails
 */
const resetPassword = async (resetToken, newPassword) => {
  // Hash the provided token
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Find user with matching reset token that hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Validate new password strength
  const passwordStrength = validatePasswordStrength(newPassword);
  if (!passwordStrength.isValid) {
    throw new Error(
      `Password is too weak. Requirements: ${passwordStrength.feedback.join(', ')}`
    );
  }

  // Update password and clear reset token
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return {
    success: true,
    message: 'Password has been reset successfully',
  };
};

/**
 * Generate unique affiliate code
 * Format: AFF + 8 alphanumeric characters
 * @returns {String} - Generated affiliate code
 */
const generateAffiliateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AFF';

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUserById,
  refreshAccessToken,
  updateUserProfile,
  changeUserPassword,
  requestPasswordReset,
  resetPassword,
  generateAffiliateCode,
};
