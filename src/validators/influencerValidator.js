/**
 * Influencer Application Validators
 * Validates influencer application form data
 */

const Joi = require('joi');

/**
 * Validate influencer application submission
 */
const validateInfluencerApplication = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
      }),

    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
      }),

    platforms: Joi.array()
      .required()
      .min(1)
      .items(
        Joi.string().valid('TikTok', 'Instagram', 'YouTube', 'Twitter', 'Twitch', 'Facebook', 'LinkedIn')
      )
      .messages({
        'array.min': 'At least one social media platform is required',
        'any.only': 'Invalid platform selected',
      }),

    socialHandles: Joi.object({
      tiktok: Joi.string().trim().allow(null, '').optional(),
      instagram: Joi.string().trim().allow(null, '').optional(),
      youtube: Joi.string().trim().allow(null, '').optional(),
      twitter: Joi.string().trim().allow(null, '').optional(),
      twitch: Joi.string().trim().allow(null, '').optional(),
      facebook: Joi.string().trim().allow(null, '').optional(),
      linkedin: Joi.string().trim().allow(null, '').optional(),
    }).required(),

    followerCount: Joi.number()
      .required()
      .integer()
      .min(100)
      .max(100000000)
      .messages({
        'number.base': 'Follower count must be a number',
        'number.min': 'Follower count must be at least 100',
      }),

    averageEngagementRate: Joi.number()
      .allow(null)
      .optional()
      .min(0)
      .max(100)
      .messages({
        'number.base': 'Engagement rate must be a number',
        'number.min': 'Engagement rate must be 0 or higher',
        'number.max': 'Engagement rate cannot exceed 100%',
      }),

    shippingAddress: Joi.object({
      street: Joi.string()
        .required()
        .trim()
        .min(5)
        .max(100)
        .messages({
          'string.empty': 'Street address is required',
          'string.min': 'Street address must be at least 5 characters',
        }),

      city: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(50)
        .messages({
          'string.empty': 'City is required',
        }),

      state: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(50)
        .messages({
          'string.empty': 'State/Province is required',
        }),

      postalCode: Joi.string()
        .required()
        .trim()
        .max(20)
        .messages({
          'string.empty': 'Postal code is required',
        }),

      country: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(50)
        .messages({
          'string.empty': 'Country is required',
        }),
    }).required(),

    phoneNumber: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .regex(/^\+?[\d\s\-()]{10,}$/)
      .messages({
        'string.pattern.base': 'Phone number format is invalid',
      }),

    contentCommitment: Joi.string()
      .required()
      .valid('videos_per_day', 'total_videos')
      .messages({
        'any.only': 'Invalid content commitment type',
      }),

    videosPerDay: Joi.number()
      .when('contentCommitment', {
        is: 'videos_per_day',
        then: Joi.number().required().min(1).max(10),
        otherwise: Joi.number().optional(),
      }),

    totalVideos: Joi.number()
      .required()
      .integer()
      .min(1)
      .max(100)
      .messages({
        'number.min': 'Total videos must be at least 1',
        'number.max': 'Total videos cannot exceed 100',
      }),
  }).strict();

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validate admin approval/rejection
 */
const validateInfluencerApproval = (data) => {
  const schema = Joi.object({
    approvalNotes: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(500)
      .messages({
        'string.max': 'Approval notes must not exceed 500 characters',
      }),

    productId: Joi.string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid product ID format',
      }),
  }).strict();

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate rejection
 */
const validateInfluencerRejection = (data) => {
  const schema = Joi.object({
    rejectionReason: Joi.string()
      .required()
      .trim()
      .min(10)
      .max(500)
      .messages({
        'string.empty': 'Rejection reason is required',
        'string.min': 'Rejection reason must be at least 10 characters',
      }),
  }).strict();

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateInfluencerApplication,
  validateInfluencerApproval,
  validateInfluencerRejection,
};
