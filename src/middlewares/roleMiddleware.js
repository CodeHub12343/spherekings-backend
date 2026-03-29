/**
 * Role-Based Access Control Middleware
 * Authorization middleware for role-specific routes
 */

/**
 * Middleware: Restrict access to specific roles
 * @param {...String} allowedRoles - Roles that are allowed access
 * @returns {Function} - Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware: Restrict to admin role
 */
const isAdmin = authorize('admin');

/**
 * Middleware: Restrict to affiliate role
 */
const isAffiliate = authorize('affiliate');

/**
 * Middleware: Restrict to customer role
 */
const isCustomer = authorize('customer');

/**
 * Middleware: Allow admin or affiliate roles
 */
const isAffiliateOrAdmin = authorize('affiliate', 'admin');

/**
 * Middleware: Allow admin or customer roles
 */
const isAdminOrCustomer = authorize('admin', 'customer');

module.exports = {
  authorize,
  isAdmin,
  isAffiliate,
  isCustomer,
  isAffiliateOrAdmin,
  isAdminOrCustomer,
};
