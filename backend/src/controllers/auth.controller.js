const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  return successResponse(res, result, 'Login successful.', 200);
};

/**
 * POST /api/auth/register
 * Registers a new user (admin action — protected in production).
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  return successResponse(res, result, 'Registration successful.', 201);
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return successResponse(res, user, 'Profile retrieved successfully.');
};

module.exports = { login, register, getMe };
