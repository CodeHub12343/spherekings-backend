/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary for proof of payment and other assets
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'raffle_uploads';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Validates file before upload
 * @param {File} file - File to validate
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)` 
    };
  }

  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Only JPEG, PNG, WebP, and GIF images are allowed' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Uploads a file to Cloudinary
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - URL of uploaded file
 * @throws {Error} - Upload error
 */
const uploadFile = async (file, options = {}) => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Add optional tags for organization
    if (options.tags) {
      formData.append('tags', options.tags);
    }
    
    // Add optional public_id for consistent naming
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    // Add folder for organization
    if (options.folder) {
      formData.append('folder', options.folder);
    } else {
      formData.append('folder', 'raffle_proofs');
    }

    // Perform upload
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('No URL returned from upload');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload file to Cloudinary');
  }
};

/**
 * Uploads a file with retry logic
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - URL of uploaded file
 */
const uploadFileWithRetry = async (file, options = {}) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFile(file, options);
    } catch (error) {
      lastError = error;
      console.warn(`Upload attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
};

/**
 * Deletes a file from Cloudinary (requires API key)
 * Note: This requires backend implementation for security
 * @param {string} publicId - Public ID of file to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteFile = async (publicId) => {
  try {
    // This should be called from backend for security
    // Frontend should not have access to delete API keys
    console.warn('File deletion should be handled by backend API');
    return false;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Gets file info from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {Object} - File information
 */
const getFileInfo = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const publicId = pathParts[pathParts.length - 1].split('.')[0];
    
    return {
      url,
      publicId,
      format: url.split('.').pop(),
      isCloudinaryUrl: url.includes('cloudinary.com'),
    };
  } catch (error) {
    console.error('Error parsing file info:', error);
    return null;
  }
};

/**
 * Generates a optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed URL
 */
const optimizeUrl = (url, transformations = {}) => {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    fetch_format = 'auto',
    crop = 'fill',
  } = transformations;

  let transform = `w_${width || 500}`;
  if (height) {
    transform += `,h_${height}`;
  }
  transform += `,q_${quality},f_${fetch_format},c_${crop}`;

  // Insert transformation before filename
  const urlParts = url.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  
  if (uploadIndex !== -1) {
    urlParts.splice(uploadIndex + 1, 0, transform);
    return urlParts.join('/');
  }

  return url;
};

export default {
  uploadFile,
  uploadFileWithRetry,
  deleteFile,
  getFileInfo,
  optimizeUrl,
  validateFile,
  CLOUDINARY_CLOUD_NAME,
};
