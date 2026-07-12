const notificationRepository = require('../repositories/notification.repository');
const prisma = require('../config/database');

const scanAndGenerateAlerts = async () => {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 1. License Expiry Check
  const drivers = await prisma.driver.findMany({
    where: {
      licenseExpiry: { lte: thirtyDaysFromNow },
    },
  });

  for (const driver of drivers) {
    const title = 'Safety Warning: Driver License Expiring Soon';
    const message = `Driver ${driver.fullName} (License: ${driver.licenseNumber}) license expires on ${driver.licenseExpiry.toLocaleDateString()}.`;
    
    // Check if notification already exists
    const existing = await prisma.notification.findFirst({
      where: { title, message },
    });

    if (!existing) {
      await notificationRepository.create({
        title,
        message,
        type: 'LICENSE_EXPIRY',
      });
    }
  }

  // 2. Scheduled Maintenance Check
  const maintenances = await prisma.maintenance.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledDate: { lte: threeDaysFromNow },
    },
    include: { vehicle: true },
  });

  for (const m of maintenances) {
    const title = 'Maintenance Alert: Service Due Soon';
    const message = `Vehicle ${m.vehicle.vehicleName} (${m.vehicle.registrationNumber}) has a scheduled maintenance '${m.maintenanceType}' scheduled on ${m.scheduledDate.toLocaleDateString()}.`;

    const existing = await prisma.notification.findFirst({
      where: { title, message },
    });

    if (!existing) {
      await notificationRepository.create({
        title,
        message,
        type: 'MAINTENANCE_DUE',
      });
    }
  }

  // 3. Upcoming Draft Trips Check
  const trips = await prisma.trip.findMany({
    where: {
      status: 'DRAFT',
      plannedDate: { lte: oneDayFromNow },
    },
  });

  for (const t of trips) {
    const title = 'Operations Notification: Scheduled Trip Pending';
    const message = `Trip ${t.tripNumber} from ${t.source} to ${t.destination} is planned on ${t.plannedDate.toLocaleDateString()}. Review assets for dispatch.`;

    const existing = await prisma.notification.findFirst({
      where: { title, message },
    });

    if (!existing) {
      await notificationRepository.create({
        title,
        message,
        type: 'TRIP_SCHEDULED',
      });
    }
  }
};

const getAll = async () => {
  // Generate any fresh alerts first
  await scanAndGenerateAlerts();
  return notificationRepository.findAll();
};

const markAsRead = async (id) => {
  return notificationRepository.update(id, { read: true });
};

const markAllAsRead = async () => {
  return notificationRepository.markAllAsRead();
};

const getUnreadCount = async () => {
  return notificationRepository.countUnread();
};

module.exports = {
  getAll,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
