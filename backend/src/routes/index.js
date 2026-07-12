const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

// Mount feature routers
router.use('/auth', authRoutes);

module.exports = router;
