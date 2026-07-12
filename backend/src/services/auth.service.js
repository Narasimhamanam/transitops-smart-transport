const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { signToken } = require('../config/jwt');

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Authenticates a user with email and password.
 * Returns a JWT token and user profile on success.
 * Locks account after 5 consecutive failed password attempts.
 * @param {{ email: string, password: string }} credentials
 */
const login = async ({ email, password }) => {
  // Find user including hashed password
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw Object.assign(new Error('No account found with this email address.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(
      new Error('Your account has been deactivated. Please contact an administrator.'),
      { statusCode: 403 }
    );
  }

  // Check if account is currently locked
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    throw Object.assign(
      new Error(`Account is locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`),
      { statusCode: 423 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData = { failedLoginAttempts: newFailedAttempts };

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      await userRepository.update(user.id, updateData);
      throw Object.assign(
        new Error('Account locked. Too many failed login attempts. Please try again after 15 minutes.'),
        { statusCode: 423 }
      );
    }

    await userRepository.update(user.id, updateData);
    const remaining = MAX_FAILED_ATTEMPTS - newFailedAttempts;
    throw Object.assign(
      new Error(`Incorrect password. You have ${remaining} attempt(s) remaining before your account is locked.`),
      { statusCode: 401 }
    );
  }

  // Successful login: reset failed attempts and lockout
  await userRepository.update(user.id, {
    lastLogin: new Date(),
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  const token = signToken({ id: user.id, role: user.role });

  // Return safe user (no password)
  const { password: _, resetToken: __, resetTokenExpiry: ___, failedLoginAttempts: ____, lockedUntil: _____, ...safeUser } = user;
  safeUser.lastLogin = new Date(); // Return current last login time in response

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

/**
 * Changes a user's password.
 * @param {string} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.findByEmailById(userId); // We need a method to get password as findById excludes it
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw Object.assign(new Error('Invalid current password.'), { statusCode: 400 });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(userId, { password: hashedNewPassword });
  return true;
};

/**
 * Requests a password reset token.
 * Logs the link in development.
 * @param {string} email
 */
const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw Object.assign(new Error('No account found with this email address.'), { statusCode: 404 });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

  await userRepository.update(user.id, {
    resetToken: hashedToken,
    resetTokenExpiry: expiry,
  });

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
  console.log(`[PASSWORD RESET LINK for ${email}]: ${resetLink}`);

  return true;
};

/**
 * Resets a password using a token.
 * @param {string} rawToken
 * @param {string} newPassword
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await userRepository.findByResetToken(hashedToken);

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw Object.assign(new Error('Invalid or expired reset token.'), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return true;
};

module.exports = { login, register, getProfile, changePassword, forgotPassword, resetPassword };
