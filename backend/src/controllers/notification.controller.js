const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/response.util');

const findAll = async (req, res) => {
  const notifications = await notificationService.getAll();
  return successResponse(res, notifications, 'Notifications retrieved successfully.');
};

const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);
  return successResponse(res, notification, 'Notification marked as read.');
};

const markAllAsRead = async (req, res) => {
  await notificationService.markAllAsRead();
  return successResponse(res, null, 'All notifications marked as read.');
};

const getUnreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount();
  return successResponse(res, { count }, 'Unread count retrieved successfully.');
};

module.exports = {
  findAll,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
