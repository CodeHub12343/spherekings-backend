/**
 * File Upload Controller
 * Handles file uploads to Cloudinary and returns URLs for database storage
 */

const cloudinaryUpload = require('../utils/cloudinaryUpload');

class FileUploadController {
  /**
   * Upload product image
   * POST /api/v1/upload/product-image
   * Body: multipart/form-data with 'image' field
   */
  async uploadProductImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      const productId = req.body.productId || 'general';

      const result = await cloudinaryUpload.uploadProductImage(
        req.file.buffer,
        productId
      );

      return res.status(200).json({
        success: true,
        message: 'Product image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple product images
   * POST /api/v1/upload/product-images
   * Body: multipart/form-data with 'images' field (up to 10 files)
   */
  async uploadProductImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided',
        });
      }

      const productId = req.body.productId || 'general';
      const uploadPromises = req.files.map((file) =>
        cloudinaryUpload.uploadProductImage(file.buffer, productId)
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      }));

      return res.status(200).json({
        success: true,
        message: `${uploadedImages.length} product images uploaded successfully`,
        data: uploadedImages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload user avatar
   * POST /api/v1/upload/avatar
   * Body: multipart/form-data with 'avatar' field
   * Auth: Required (uses authenticated user ID)
   */
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No avatar file provided',
        });
      }

      const userId = req.user?.id || req.body.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID required for avatar upload',
        });
      }

      const result = await cloudinaryUpload.uploadAvatar(req.file.buffer, userId);

      return res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload document (receipt, invoice, etc.)
   * POST /api/v1/upload/document
   * Body: multipart/form-data with 'document' field and 'docType' field
   * Auth: Required
   */
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file provided',
        });
      }

      const userId = req.user?.id || req.body.userId;
      const docType = req.body.docType || 'general';

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID required for document upload',
        });
      }

      const result = await cloudinaryUpload.uploadDocument(
        req.file.buffer,
        docType,
        userId
      );

      return res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file from Cloudinary
   * DELETE /api/v1/upload/:publicId
   * Params: publicId - Cloudinary public ID of file to delete
   */
  async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID required for file deletion',
        });
      }

      await cloudinaryUpload.deleteFile(publicId);

      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get image transformation URL
   * GET /api/v1/upload/transform/:publicId
   * Query: width, height, crop, quality, etc.
   */
  async getTransformedUrl(req, res, next) {
    try {
      const { publicId } = req.params;
      const transformations = req.query;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID required',
        });
      }

      const url = cloudinaryUpload.getImageUrl(publicId, transformations);

      return res.status(200).json({
        success: true,
        data: {
          url,
          publicId,
          transformations,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileUploadController();
