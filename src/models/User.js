/**
 * User Model
 * Defines the User schema and related methods for authentication and profile management
 * Supports three roles: customer, affiliate, admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default on queries
    },

    // Role and Permissions
    role: {
      type: String,
      enum: ['customer', 'affiliate', 'admin'],
      default: 'customer',
      lowercase: true,
    },

    // Affiliate-Specific Fields
    // Note: Affiliate details (including affiliateCode) are stored in Affiliate model
    // User is linked to Affiliate via userId reference in Affiliate model
    affiliateStatus: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending',
    },

    // Email Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Account Security
    lastLogin: {
      type: Date,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Profile Information (optional)
    phoneNumber: {
      type: String,
      trim: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    profileImage: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    // Account Metadata
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'users',
  }
);

/**
 * Middleware: Hash password before saving
 * Only hash if password is new or modified
 */
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method: Compare provided password with hashed password
 * @param {String} enteredPassword - Password entered by user
 * @returns {Promise<Boolean>} - True if passwords match
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method: Update last login timestamp
 */
UserSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

/**
 * Method: Increment login attempts
 */
UserSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (
    this.lockUntil &&
    this.lockUntil < Date.now()
  ) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise incrementing
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts
  const maxAttempts = 5;
  const lockTime = 2; // hours
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: new Date(Date.now() + lockTime * 60 * 60 * 1000),
    };
  }

  return this.updateOne(updates);
};

/**
 * Method: Check if account is locked
 */
UserSchema.methods.isLocked = function () {
  // Check for delayed lock expiration
  return (
    this.lockUntil &&
    this.lockUntil > Date.now()
  );
};

/**
 * Method: Reset login attempts after successful login
 */
UserSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Method: Remove sensitive fields from response
 */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.__v;
  return obj;
};

/**
 * Virtual: Check if user can be deleted (soft delete)
 */
UserSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
