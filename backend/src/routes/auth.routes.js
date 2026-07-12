const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

const router = Router();

// Rate limiter for login: max 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for forgot-password: max 5 requests per 1 hour
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// GET /api/auth/me — Protected
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/change-password — Protected
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// POST /api/auth/forgot-password — Public
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password — Public
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
