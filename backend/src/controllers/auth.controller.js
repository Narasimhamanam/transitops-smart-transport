const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response.util');

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

/**
 * PUT /api/auth/change-password
 * Changes the authenticated user's password.
 */
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, oldPassword, newPassword);
  return successResponse(res, null, 'Password changed successfully.');
};

/**
 * POST /api/auth/forgot-password
 * Generates and logs a reset token for the given email.
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  return successResponse(res, null, 'If the email exists, a password reset link has been logged/sent.');
};

/**
 * POST /api/auth/reset-password
 * Resets password using a valid token.
 */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return successResponse(res, null, 'Password reset successfully. You can now log in with your new password.');
};

module.exports = {
  login,
  register,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
