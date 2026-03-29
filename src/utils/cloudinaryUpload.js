/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary using SDK
 * Supports product images, avatar uploads, and documents
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload single file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with secure_url and public_id
 */
async function uploadFile(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType || 'auto',
        folder: options.folder || 'spherekings',
        public_id: options.publicId,
        overwrite: options.overwrite || false,
        quality: options.quality || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload product image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} productId - Product ID for folder organization
 * @returns {Promise<Object>} Upload result with secure_url
 */
async function uploadProductImage(fileBuffer, productId) {
  try {
    const result = await uploadFile(fileBuffer, {
      folder: `spherekings/products/${productId}`,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      // Cloudinary transformations
      transformations: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'auto',
        },
      ],
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(`Product image upload failed: ${error.message}`);
  }
}

/**
 * Upload user avatar to Cloudinary
 * @param {Buffer} fileBuffer - Avatar file buffer from multer
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<Object>} Upload result with secure_url
 */
async function uploadAvatar(fileBuffer, userId) {
  try {
    const result = await uploadFile(fileBuffer, {
      folder: `spherekings/avatars/${userId}`,
      resource_type: 'image',
      quality: 'auto',
      // Circular avatar transformation
      transformations: [
        {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          radius: 'max',
        },
      ],
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    };
  } catch (error) {
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
}

/**
 * Upload document (PDF, etc.) to Cloudinary
 * @param {Buffer} fileBuffer - Document file buffer from multer
 * @param {string} docType - Document type (receipt, invoice, etc.)
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<Object>} Upload result with secure_url
 */
async function uploadDocument(fileBuffer, docType, userId) {
  try {
    const result = await uploadFile(fileBuffer, {
      folder: `spherekings/documents/${userId}/${docType}`,
      resource_type: 'raw',
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id of file to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
}

/**
 * Delete multiple files from Cloudinary
 * @param {Array<string>} publicIds - Array of public_ids to delete
 * @returns {Promise<Array>} Array of deletion results
 */
async function deleteMultipleFiles(publicIds) {
  try {
    const deletionPromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId)
    );
    const results = await Promise.all(deletionPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple file deletion failed: ${error.message}`);
  }
}

/**
 * Get image transformation URL
 * Useful for responsive image serving
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
function getImageUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    ...options,
  });
}

/**
 * Validate Cloudinary configuration
 * @returns {boolean} True if all required env variables are set
 */
function isConfigured() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

module.exports = {
  uploadFile,
  uploadProductImage,
  uploadAvatar,
  uploadDocument,
  deleteFile,
  deleteMultipleFiles,
  getImageUrl,
  isConfigured,
  cloudinary, // Export cloudinary instance for direct access if needed
};
