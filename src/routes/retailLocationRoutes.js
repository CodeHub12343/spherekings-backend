/**
 * Retail Location Routes
 * All retail location endpoints
 *
 * Public Routes:
 *   GET  /api/v1/retail-locations           - Get all retail locations (paginated)
 *   GET  /api/v1/retail-locations/:id       - Get single location
 *   GET  /api/v1/retail-locations/featured/list    - Get featured locations
 *   GET  /api/v1/retail-locations/countries/available - Get available countries
 *   GET  /api/v1/retail-locations/count/total      - Get total count
 *   GET  /api/v1/retail-locations/by-country/:country - Get locations by country
 *
 * Admin Routes (Protected):
 *   POST /api/v1/retail-locations           - Create new location
 *   PUT  /api/v1/retail-locations/:id       - Update location
 *   DELETE /api/v1/retail-locations/:id     - Delete location
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const retailLocationController = require('../controllers/retailLocationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { handleMulterError } = require('../middlewares/fileUploadMiddleware');

// Configure logo upload (single file with field name 'logo')
const memoryStorage = multer.memoryStorage();
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Allowed types: JPG, PNG, WebP, GIF'), false);
  }
};
const uploadLogo = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * ===== PUBLIC ROUTES (No authentication required) =====
 */

/**
 * GET /api/v1/retail-locations
 * Get all retail locations with pagination and filtering
 * Query parameters:
 *   - page: page number (default: 1)
 *   - limit: results per page (default: 20)
 *   - city: filter by city
 *   - country: filter by country
 *   - featured: filter by featured status (true/false)
 *   - sortBy: field to sort by (name, city, country, createdAt)
 *   - order: sort direction (asc/desc)
 */
router.get('/', retailLocationController.getRetailLocations);

/**
 * GET /api/v1/retail-locations/featured/list
 * Get featured retail locations (for homepage)
 * Query: ?limit=5
 * Important: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/featured/list', retailLocationController.getFeaturedRetailLocations);

/**
 * GET /api/v1/retail-locations/countries/available
 * Get list of all countries with active retail locations
 * Useful for building location filters
 * Important: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/countries/available', retailLocationController.getAvailableCountries);

/**
 * GET /api/v1/retail-locations/count/total
 * Get total count of active retail locations
 * Important: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/count/total', retailLocationController.getTotalRetailLocationCount);

/**
 * GET /api/v1/retail-locations/by-country/:country
 * Get retail locations for a specific country
 * Parameters: country (country name)
 * Important: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/by-country/:country', retailLocationController.getRetailLocationsByCountry);

/**
 * GET /api/v1/retail-locations/:id
 * Get a single retail location by ID
 * Parameters: id (MongoDB ID)
 * Important: This route must come LAST after all specific routes
 */
router.get('/:id', retailLocationController.getRetailLocation);

/**
 * ===== ADMIN ROUTES (Authentication + Authorization required) =====
 */

/**
 * POST /api/v1/retail-locations
 * Create a new retail location
 * Body: multipart/form-data
 *   - name: string (required)
 *   - address: string (required)
 *   - city: string (required)
 *   - state: string (required)
 *   - country: string (required)
 *   - description: string (required)
 *   - logo: file (required) - will be uploaded to Cloudinary
 *   - websiteUrl: string (optional)
 *   - phone: string (optional)
 *   - isFeatured: boolean (optional)
 * Protected: Admin only
 */
router.post(
  '/',
  authenticateToken,
  authorize('admin'),
  uploadLogo.single('logo'),
  retailLocationController.createRetailLocation
);

/**
 * PUT /api/v1/retail-locations/:id
 * Update a retail location
 * Parameters: id (MongoDB ID)
 * Body: multipart/form-data (all fields optional, partial update)
 * Protected: Admin only
 */
router.put(
  '/:id',
  authenticateToken,
  authorize('admin'),
  uploadLogo.single('logo'),
  retailLocationController.updateRetailLocation
);

/**
 * DELETE /api/v1/retail-locations/:id
 * Delete a retail location (soft delete - sets isActive to false)
 * Parameters: id (MongoDB ID)
 * Protected: Admin only
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize('admin'),
  retailLocationController.deleteRetailLocation
);

// Error handling middleware for multer
router.use(handleMulterError);

module.exports = router;
