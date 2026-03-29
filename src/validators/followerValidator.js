/**
 * Follower Validator
 * Joi schemas for follower subscription and management
 */

const Joi = require('joi');

/**
 * Schema for follower subscription
 * Required: email
 */
const subscribeFollowerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  source: Joi.string()
    .valid('landing_page', 'popup', 'affiliate_link', 'admin')
    .default('landing_page'),
});

/**
 * Schema for unsubscribing
 */
const unsubscribeFollowerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
});

/**
 * Validation function with error formatting
 */
function validateFollowerSubscription(data) {
  return subscribeFollowerSchema.validate(data, { abortEarly: false });
}

function validateFollowerUnsubscription(data) {
  return unsubscribeFollowerSchema.validate(data, { abortEarly: false });
}

module.exports = {
  subscribeFollowerSchema,
  unsubscribeFollowerSchema,
  validateFollowerSubscription,
  validateFollowerUnsubscription,
};
