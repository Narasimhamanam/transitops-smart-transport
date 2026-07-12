import api from './api';

/**
 * Authenticate user with email and password.
 * @param {{ email: string, password: string }} credentials
 */
export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role: string }} payload
 */
export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

/**
 * Get the currently authenticated user's profile.
 */
export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

/**
 * Change the currently authenticated user's password.
 * @param {{ oldPassword: string, newPassword: string, confirmPassword: string }} payload
 */
export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/change-password', payload);
  return data;
};

/**
 * Request a password reset link.
 * @param {{ email: string }} payload
 */
export const forgotPassword = async (payload) => {
  const { data } = await api.post('/auth/forgot-password', payload);
  return data;
};

/**
 * Reset password using a valid reset token.
 * @param {{ token: string, password: string, confirmPassword: string }} payload
 */
export const resetPassword = async (payload) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};
