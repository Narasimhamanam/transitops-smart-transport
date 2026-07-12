const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// GET /api/auth/me — Protected
router.get('/me', authenticate, authController.getMe);

module.exports = router;
