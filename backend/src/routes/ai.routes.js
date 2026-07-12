const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

// Only Fleet Manager can access AI Insights
router.get('/insights', authorize('FLEET_MANAGER'), aiController.getInsights);

module.exports = router;
