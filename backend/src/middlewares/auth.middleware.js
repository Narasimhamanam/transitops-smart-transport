const { verifyToken } = require('../config/jwt');
const { errorResponse } = require('../utils/response.util');
const userRepository = require('../repositories/user.repository');

/**
 * Middleware: Verifies JWT token and attaches user to request.
 * Expects: Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please log in.', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User not found. Token may be invalid.', null, 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Contact admin.', null, 403);
    }

    // Attach user to request (exclude password)
    const { password: _, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token. Please log in again.', null, 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please log in again.', null, 401);
    }
    next(error);
  }
};

/**
 * Middleware factory: Restricts access to specified roles.
 * @param {...string} roles - Allowed role names
 * @example authorize('FLEET_MANAGER', 'DISPATCHER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        null,
        403
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };
