const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/insights', aiController.getInsights);

module.exports = router;
