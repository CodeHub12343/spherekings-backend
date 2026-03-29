/**
 * Multer File Upload Configuration
 * Handles file validation and temporary storage for uploads
 * Used with Cloudinary for final cloud storage
 */

const multer = require('multer');
const path = require('path');

// Configure storage (memory storage - files stored in RAM before upload to Cloudinary)
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type. Allowed types: JPG, PNG, WebP, GIF`), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  // Allowed document types
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid document type. Allowed: PDF, DOC, DOCX, XLS, XLSX`), false);
  }
};

// Size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max file size
};

// Image upload middleware - single file
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits,
});

// Images upload middleware - multiple files
const uploadMultipleImages = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

// Avatar upload middleware
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for avatars
  },
});

// Document upload middleware
const uploadDocument = multer({
  storage: memoryStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max for documents
  },
});

/**
 * Middleware factory for validating upload
 * Ensures file exists before processing
 */
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file provided',
    });
  }
  next();
};

/**
 * Custom error handler for multer
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next();
};

module.exports = {
  uploadImage: uploadImage.single('image'),
  uploadMultipleImages: uploadMultipleImages.array('images', 10),
  uploadAvatar: uploadAvatar.single('avatar'),
  uploadDocument: uploadDocument.single('document'),
  validateUpload,
  handleMulterError,
};
