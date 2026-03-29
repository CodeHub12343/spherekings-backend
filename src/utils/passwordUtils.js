/**
 * Password Utility Functions
 * Handles password hashing, validation, and security checks
 */

const bcrypt = require('bcryptjs');

/**
 * Hash a password using bcrypt
 * @param {String} password - Plain text password to hash
 * @param {Number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<String>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Compare plain text password with hashed password
 * @param {String} plainPassword - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} - True if passwords match
 */
const comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};

/**
 * Validate password strength
 * Requirements:
 * - At least 6 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (recommended but not required)
 * @param {String} password - Password to validate
 * @returns {Object} - Validation result and feedback
 */
const validatePasswordStrength = (password) => {
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const strength = {
    score: 0,
    feedback: [],
    isValid: true,
  };

  // Length check
  if (password.length < minLength) {
    strength.isValid = false;
    strength.feedback.push(`Password must be at least ${minLength} characters`);
  } else {
    strength.score += 1;
  }

  // Uppercase check
  if (!hasUppercase) {
    strength.feedback.push('Add at least one uppercase letter');
  } else {
    strength.score += 1;
  }

  // Lowercase check
  if (!hasLowercase) {
    strength.feedback.push('Add at least one lowercase letter');
  } else {
    strength.score += 1;
  }

  // Number check
  if (!hasNumber) {
    strength.feedback.push('Add at least one number');
  } else {
    strength.score += 1;
  }

  // Special character check (bonus)
  if (hasSpecialChar) {
    strength.score += 1;
  } else {
    strength.feedback.push('Consider adding special characters for stronger security');
  }

  // Calculate strength level
  if (strength.score <= 2) {
    strength.level = 'weak';
  } else if (strength.score <= 3) {
    strength.level = 'fair';
  } else if (strength.score <= 4) {
    strength.level = 'good';
  } else {
    strength.level = 'strong';
  }

  return strength;
};

/**
 * Check if password meets minimum requirements
 * @param {String} password - Password to check
 * @returns {Boolean} - True if password meets requirements
 */
const isPasswordValid = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Minimum requirements
  const minLength = 6;
  if (password.length < minLength) {
    return false;
  }

  return true;
};

/**
 * Generate a secure random token for password reset
 * @param {Number} length - Token length in bytes (default: 32)
 * @returns {String} - Random token (hex encoded)
 */
const generateResetToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  hashPassword,
  comparePasswords,
  validatePasswordStrength,
  isPasswordValid,
  generateResetToken,
};
