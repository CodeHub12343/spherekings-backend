/**
 * File Upload Routes
 * Handles all file upload endpoints
 */

const express = require('express');

const fileUploadController = require('../controllers/fileUploadController');
const {
  uploadImage,
  uploadMultipleImages,
  uploadAvatar,
  uploadDocument,
  validateUpload,
  handleMulterError,
} = require('../middlewares/fileUploadMiddleware');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * POST /api/v1/upload/product-image
 * Upload single product image
 * Body: multipart/form-data
 *   - image: Image file (required)
 *   - productId: Product ID (optional)
 * Response: { success, data: { url, publicId, format, width, height, size } }
 */
router.post(
  '/product-image',
  uploadImage,
  validateUpload,
  fileUploadController.uploadProductImage
);

/**
 * POST /api/v1/upload/product-images
 * Upload multiple product images (max 10)
 * Body: multipart/form-data
 *   - images: Image files (required, max 10)
 *   - productId: Product ID (optional)
 * Response: { success, data: [{ url, publicId, format, ... }, ...] }
 */
router.post(
  '/product-images',
  uploadMultipleImages,
  validateUpload,
  fileUploadController.uploadProductImages
);

/**
 * POST /api/v1/upload/avatar
 * Upload user avatar (requires authentication)
 * Body: multipart/form-data
 *   - avatar: Avatar image file (required)
 * Header: Authorization: Bearer <token>
 * Response: { success, data: { url, publicId, format } }
 */
router.post(
  '/avatar',
  authenticateToken,
  uploadAvatar,
  validateUpload,
  fileUploadController.uploadAvatar
);

/**
 * POST /api/v1/upload/document
 * Upload document file (requires authentication)
 * Body: multipart/form-data
 *   - document: Document file (required)
 *   - docType: Document type like 'receipt', 'invoice' (optional)
 * Header: Authorization: Bearer <token>
 * Response: { success, data: { url, publicId, format, size } }
 */
router.post(
  '/document',
  authenticateToken,
  uploadDocument,
  validateUpload,
  fileUploadController.uploadDocument
);

/**
 * DELETE /api/v1/upload/:publicId
 * Delete file from Cloudinary
 * Params: publicId - Cloudinary public ID
 * Response: { success, message }
 */
router.delete('/:publicId', fileUploadController.deleteFile);

/**
 * GET /api/v1/upload/transform/:publicId
 * Get transformed image URL with Cloudinary effects
 * Params: publicId - Cloudinary public ID
 * Query params (optional):
 *   - width: Image width
 *   - height: Image height
 *   - crop: Crop mode (fill, thumb, scale, fit, pad)
 *   - quality: Image quality (auto, 80, 90, etc.)
 *   - radius: Border radius (max for circle)
 *   - gravity: Focus point (auto, face, center, etc.)
 * Response: { success, data: { url, publicId, transformations } }
 */
router.get('/transform/:publicId', fileUploadController.getTransformedUrl);

// Error handling for multer
router.use(handleMulterError);

module.exports = router;
