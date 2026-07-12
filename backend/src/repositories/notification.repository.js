const prisma = require('../config/database');

const findAll = async () => {
  return prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const create = async (data) => {
  return prisma.notification.create({ data });
};

const update = async (id, data) => {
  return prisma.notification.update({
    where: { id },
    data,
  });
};

const markAllAsRead = async () => {
  return prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
};

const countUnread = async () => {
  return prisma.notification.count({
    where: { read: false },
  });
};

const deleteById = async (id) => {
  return prisma.notification.delete({ where: { id } });
};

module.exports = {
  findAll,
  create,
  update,
  markAllAsRead,
  countUnread,
  deleteById,
};
