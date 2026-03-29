/**
 * Product Validation Schemas
 * Zod schemas that match backend Joi validation
 * Used for client-side form validation
 */

import { z } from 'zod';

/**
 * Product name validation
 * Backend: min 3, max 100 chars
 */
const productNameSchema = z
  .string()
  .min(3, 'Product name must be at least 3 characters')
  .max(100, 'Product name cannot exceed 100 characters')
  .trim();

/**
 * Product description validation
 * Backend: min 20, max 2000 chars
 */
const productDescriptionSchema = z
  .string()
  .min(20, 'Description must be at least 20 characters')
  .max(2000, 'Description cannot exceed 2000 characters')
  .trim();

/**
 * Product price validation
 * Backend: min 0.01
 */
const productPriceSchema = z
  .number()
  .min(0.01, 'Price must be greater than 0')
  .finite('Price must be a valid number');

/**
 * Stock validation
 * Backend: min 0
 */
const stockSchema = z
  .number()
  .int('Stock must be a whole number')
  .min(0, 'Stock cannot be negative');

/**
 * Product images validation
 * Backend: 1-10 images required
 */
const imagesSchema = z
  .array(z.string().url('Each image must be a valid URL'))
  .min(1, 'At least one product image is required')
  .max(10, 'Product can have maximum 10 images');

/**
 * Variant option validation
 * Backend: 1-20 options per variant
 */
const variantOptionSchema = z
  .array(z.string().trim().min(1))
  .min(1, 'Variant must have at least one option')
  .max(20, 'Variant cannot have more than 20 options');

/**
 * Single variant validation
 */
const singleVariantSchema = z.object({
  name: z.enum(['color', 'edition', 'size', 'material']),
  options: variantOptionSchema,
});

/**
 * Product variants validation array
 * Backend: optional, but if provided must be valid
 */
const variantsSchema = z.array(singleVariantSchema).optional();

/**
 * Category validation
 * Backend: optional, any string
 */
const categorySchema = z.string().trim().toLowerCase().optional().or(z.literal(''));

/**
 * SKU validation
 * Backend: optional, unique, uppercase
 */
const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .or(z.literal(''));

/**
 * Featured flag validation
 */
const isFeaturedSchema = z.boolean().optional().default(false);

/**
 * Status validation
 * Backend: active, inactive, out_of_stock
 */
const statusSchema = z
  .enum(['active', 'inactive', 'out_of_stock'])
  .optional()
  .default('active');

/**
 * Create Product Schema
 * Used for form validation when creating new products
 */
export const createProductSchema = z.object({
  name: productNameSchema,
  description: productDescriptionSchema,
  price: productPriceSchema,
  images: imagesSchema,
  stock: stockSchema,
  variants: variantsSchema,
  category: categorySchema,
  sku: skuSchema,
  isFeatured: isFeaturedSchema,
  status: statusSchema,
});

/**
 * Update Product Schema
 * All fields are optional for updates
 */
export const updateProductSchema = z.object({
  name: productNameSchema.optional(),
  description: productDescriptionSchema.optional(),
  price: productPriceSchema.optional(),
  images: imagesSchema.optional(),
  stock: stockSchema.optional(),
  variants: variantsSchema,
  category: categorySchema,
  sku: skuSchema,
  isFeatured: isFeaturedSchema,
  status: statusSchema,
});

/**
 * Update Stock Schema
 */
export const updateStockSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be positive'),
  operation: z.enum(['increment', 'decrement']).optional().default('decrement'),
});

/**
 * Search Products Schema
 */
export const searchProductsSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
});

/**
 * Product Filter Schema
 */
export const productFilterSchema = z.object({
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * Validate product data against a schema
 */
export const validateProduct = (data, schema) => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { valid: false, data: null, errors };
    }
    return { valid: false, data: null, errors: { form: 'Validation failed' } };
  }
};
