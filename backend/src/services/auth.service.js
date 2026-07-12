const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { signToken } = require('../config/jwt');

const SALT_ROUNDS = 12;

/**
 * Authenticates a user with email and password.
 * Returns a JWT token and user profile on success.
 * @param {{ email: string, password: string }} credentials
 */
const login = async ({ email, password }) => {
  // Find user including hashed password
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Use a generic message to prevent email enumeration
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(
      new Error('Your account has been deactivated. Please contact an administrator.'),
      { statusCode: 403 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const token = signToken({ id: user.id, role: user.role });

  // Return safe user (no password)
  const { password: _, ...safeUser } = user;

  return { token, user: safeUser };
};

/**
 * Registers a new user.
 * Returns a JWT token and user profile on success.
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
const register = async ({ name, email, password, role }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw Object.assign(
      new Error('An account with this email already exists.'),
      { statusCode: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ name, email, password: hashedPassword, role });

  const token = signToken({ id: user.id, role: user.role });

  return { token, user };
};

/**
 * Returns the authenticated user's profile.
 * @param {string} userId
 */
const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  return user;
};

module.exports = { login, register, getProfile };
