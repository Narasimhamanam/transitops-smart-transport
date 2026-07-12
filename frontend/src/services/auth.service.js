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
