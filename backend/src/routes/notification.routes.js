const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/',               notificationController.findAll);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.get('/unread-count',   notificationController.getUnreadCount);
router.put('/:id/read',       notificationController.markAsRead);

module.exports = router;
