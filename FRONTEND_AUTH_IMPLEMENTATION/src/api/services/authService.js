/**
 * Auth Service
 * Handles all authentication API calls
 */

import client from '@/api/client';

// Define endpoints directly to avoid import issues
const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  try {
    // The backend expects a single 'name' field (not firstName/lastName)
    // Combine firstName and lastName into a single name field
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    
    const requestData = {
      name: fullName,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      agreeToTerms: userData.agreeToTerms === true, // Ensure it's boolean true
      role: 'customer', // Default role
      ...(userData.ref && { ref: userData.ref }), // Include ref parameter if provided (for affiliate tracking)
    };
    
    // Log exactly what we're sending
    console.log('📤 SENDING DATA TO BACKEND:');
    console.log('  Endpoint:', AUTH_ENDPOINTS.REGISTER + (userData.ref ? `?ref=${userData.ref}` : ''));
    console.log('  name:', `"${requestData.name}" (${requestData.name.length} chars)`);
    console.log('  email:', `"${requestData.email}"`);
    console.log('  password:', `"${requestData.password}" (${requestData.password.length} chars)`);
    console.log('  confirmPassword:', `"${requestData.confirmPassword}" (${requestData.confirmPassword.length} chars)`);
    console.log('  agreeToTerms:', requestData.agreeToTerms);
    console.log('  role:', `"${requestData.role}"`);
    if (userData.ref) {
      console.log('  🔗 ref (affiliate) - AS QUERY PARAM:', `"${userData.ref}"`, `← AFFILIATE LINK!`);
    }
    console.log('  Full request object:', requestData);
    
    const response = await client.post(
      AUTH_ENDPOINTS.REGISTER + (userData.ref ? `?ref=${encodeURIComponent(userData.ref)}` : ''),
      requestData
    );
    
    console.log('✅ Registration successful! Response:', {
      success: response.data.success,
      message: response.data.message,
      hasTokens: !!response.data.tokens,
      hasUser: !!response.data.data?.user,
    });
    
    // Transform backend response to match frontend expectations
    // Backend returns: { success, message, data: { user }, tokens: { accessToken, refreshToken } }
    // Frontend expects: { user, accessToken, refreshToken }
    return {
      user: response.data.data?.user,
      accessToken: response.data.tokens?.accessToken,
      refreshToken: response.data.tokens?.refreshToken,
    };
  } catch (error) {
    // Log detailed error info for debugging
    const backendResponse = error.response?.data;
    
    // Log the raw response first
    console.error('❌ Registration Error - Status:', error.response?.status);
    console.error('❌ Full Backend Response:', backendResponse);
    
    // Backend returns { success: false, message: '...', errors: { fieldName: 'message' } }
    let errorMessage = backendResponse?.message || 'Registration failed';
    
    // If backend sent validation errors, show them
    if (backendResponse?.errors) {
      console.error('📋 VALIDATION ERRORS DETAILS:', backendResponse.errors);
      
      if (typeof backendResponse.errors === 'object') {
        // errors is { fieldName: 'message', ... }
        const errorEntries = Object.entries(backendResponse.errors);
        console.error('Error entries:', errorEntries);
        
        const errorMessages = errorEntries
          .map(([field, msg]) => {
            console.error(`  ❌ ${field}: ${msg}`);
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n\n' + errorMessages;
      } else if (Array.isArray(backendResponse.errors)) {
        // errors is ['message1', 'message2', ...]
        console.error('Errors array:', backendResponse.errors);
        errorMessage += '\n\n' + backendResponse.errors.join('\n');
      }
    }
    
    console.error('🔴 FINAL ERROR MESSAGE:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    const response = await client.post(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    
    console.log('✅ Login successful! Response:', {
      success: response.data.success,
      message: response.data.message,
      hasTokens: !!response.data.tokens,
      hasUser: !!response.data.data?.user,
    });
    
    // Transform backend response to match frontend expectations
    // Backend returns: { success, message, data: { user }, tokens: { accessToken, refreshToken } }
    // Frontend expects: { user, accessToken, refreshToken }
    return {
      user: response.data.data?.user,
      accessToken: response.data.tokens?.accessToken,
      refreshToken: response.data.tokens?.refreshToken,
    };
  } catch (error) {
    const backendResponse = error.response?.data;
    
    console.error('❌ Login Error:', {
      status: error.response?.status,
      message: backendResponse?.message,
      errors: backendResponse?.errors,
    });
    
    const errorMessage = backendResponse?.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const response = await client.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error) {
    // Even if logout fails on backend, clear local tokens
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await client.post(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );
    
    console.log('✅ Token refreshed successfully!');
    
    // Backend returns: { success, message, data: { user }, tokens: { accessToken, refreshToken } }
    // Frontend expects: { user, accessToken, refreshToken }
    return {
      user: response.data.data?.user,
      accessToken: response.data.tokens?.accessToken,
      refreshToken: response.data.tokens?.refreshToken,
    };
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    throw error;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const response = await client.get(AUTH_ENDPOINTS.ME);
    
    console.log('✅ Got current user:', {
      success: response.data.success,
      hasUser: !!response.data.data?.user,
    });
    
    // Backend returns: { success, message, data: { user } }
    // Frontend expects: user object
    return response.data.data?.user;
  } catch (error) {
    console.error('❌ Get current user error:', error.message);
    throw error;
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (email) => {
  const response = await client.post(
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    { email }
  );
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (resetToken, newPassword, confirmPassword) => {
  const response = await client.post(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    {
      resetToken,
      newPassword,
      confirmPassword,
    }
  );
  return response.data;
};

/**
 * Export as named exports
 */
export const authService = {
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  refreshToken: refreshAccessToken,
  getCurrentUser: getCurrentUser,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
};

/**
 * Export as default
 */
export default authService;
