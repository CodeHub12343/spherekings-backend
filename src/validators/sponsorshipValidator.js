/**
 * Sponsorship Validators
 * Validates sponsorship purchase and admin operations
 */

const Joi = require('joi');

/**
 * Validate sponsorship purchase initialization
 */
const validateSponsorshipPurchase = (data) => {
  const schema = Joi.object({
    tierId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.empty': 'Sponsorship tier is required',
        'string.pattern.base': 'Invalid tier ID format',
      }),

    sponsorName: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.empty': 'Sponsor name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
      }),

    sponsorEmail: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Sponsor email is required',
        'string.email': 'Please provide a valid email address',
      }),

    sponsorCompany: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(100)
      .messages({
        'string.max': 'Company name must not exceed 100 characters',
      }),

    sponsorContact: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(100),
  }).strict();

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validate sponsorship record update (admin)
 */
const validateSponsorshipUpdate = (data) => {
  const schema = Joi.object({
    videoUrl: Joi.string()
      .trim()
      .regex(/^https?:\/\/.+/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid video URL format',
        'any.required': 'Video URL is required',
      }),

    platform: Joi.string()
      .valid('YouTube', 'TikTok', 'Instagram', 'Twitter', 'Twitch', 'Facebook')
      .required()
      .messages({
        'any.only': 'Invalid platform selected',
        'any.required': 'Platform is required',
      }),

    title: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(200),

    description: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(500),

    postedAt: Joi.alternatives()
      .try(
        Joi.date(),
        Joi.string().isoDate()
      )
      .optional()
      .messages({
        'alternatives.match': 'Posted date must be a valid date or ISO string',
      }),

    views: Joi.number()
      .integer()
      .min(0)
      .optional()
      .default(0),

    likes: Joi.number()
      .integer()
      .min(0)
      .optional()
      .default(0),

    comments: Joi.number()
      .integer()
      .min(0)
      .optional()
      .default(0),

    shares: Joi.number()
      .integer()
      .min(0)
      .optional()
      .default(0),

    adminNotes: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(500),
  }).strict();

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate sponsorship status update
 */
const validateSponsorshipStatusUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .required()
      .valid('pending_payment', 'active', 'in_progress', 'completed', 'overdue', 'failed')
      .messages({
        'any.only': 'Invalid sponsorship status',
      }),

    failureReason: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(500),

    adminNotes: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(1000),
  }).strict();

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate sponsorship tier creation/update (admin)
 */
const validateSponsorshipTier = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(50)
      .messages({
        'string.empty': 'Tier name is required',
        'string.min': 'Name must be at least 3 characters',
      }),

    slug: Joi.string()
      .required()
      .lowercase()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and dashes',
      }),

    price: Joi.number()
      .required()
      .min(100)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Minimum price is $1',
      }),

    benefitsSummary: Joi.string()
      .required()
      .trim()
      .min(10)
      .max(300)
      .messages({
        'string.empty': 'Benefits summary is required',
        'string.min': 'Benefits summary must be at least 10 characters',
      }),

    benefits: Joi.array()
      .required()
      .min(1)
      .max(10)
      .items(Joi.string().trim().min(10).max(150))
      .messages({
        'array.min': 'At least one benefit is required',
        'array.max': 'Maximum 10 benefits allowed',
      }),

    description: Joi.string()
      .required()
      .trim()
      .min(20)
      .max(1000)
      .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 20 characters',
      }),

    defaultDeliveryDays: Joi.number()
      .required()
      .integer()
      .min(7)
      .max(365)
      .messages({
        'number.min': 'Delivery days must be at least 7',
        'number.max': 'Delivery days cannot exceed 365',
      }),

    campaignCycle: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': 'Campaign cycle is required',
      }),

    featured: Joi.boolean().optional().default(false),

    displayOrder: Joi.number().integer().min(0).optional().default(0),

    icon: Joi.string().trim().optional().default('👑'),

    badgeText: Joi.string()
      .allow(null, '')
      .optional()
      .trim()
      .max(50),

    cardColor: Joi.string()
      .optional()
      .trim()
      .default('white'),

    active: Joi.boolean().optional().default(true),

    maxSponsors: Joi.number()
      .allow(null)
      .optional()
      .integer()
      .min(1)
      .messages({
        'number.min': 'Max sponsors must be at least 1',
      }),
  }).strict();

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSponsorshipPurchase,
  validateSponsorshipUpdate,
  validateSponsorshipStatusUpdate,
  validateSponsorshipTier,
};
