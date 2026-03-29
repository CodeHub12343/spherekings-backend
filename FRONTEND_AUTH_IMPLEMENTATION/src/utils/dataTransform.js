/**
 * Data Transformation Utilities
 * Convert between camelCase (frontend) and snake_case (backend)
 */

/**
 * Convert camelCase object keys to snake_case
 * Example: { firstName: "John" } → { first_name: "John" }
 */
export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Recursively convert nested objects
    result[snakeKey] = typeof value === 'object' && !Array.isArray(value) 
      ? toSnakeCase(value) 
      : value;
  }
  
  return result;
};

/**
 * Convert snake_case object keys to camelCase
 * Example: { first_name: "John" } → { firstName: "John" }
 */
export const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Recursively convert nested objects
    result[camelKey] = typeof value === 'object' && !Array.isArray(value) 
      ? toCamelCase(value) 
      : value;
  }
  
  return result;
};

/**
 * Transform registration data for backend
 * Removes empty optional fields and converts to snake_case
 */
export const prepareRegisterData = (userData) => {
  const cleaned = {
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
  };
  
  // Only add phone if provided
  if (userData.phone?.trim()) {
    cleaned.phone = userData.phone;
  }
  
  // Try both formats: camelCase and snake_case
  // Try camelCase first, if that fails backend will try snake_case
  return cleaned;
};

/**
 * Transform login data for backend
 */
export const prepareLoginData = (credentials) => {
  return {
    email: credentials.email,
    password: credentials.password,
  };
};

export default {
  toSnakeCase,
  toCamelCase,
  prepareRegisterData,
  prepareLoginData,
};
