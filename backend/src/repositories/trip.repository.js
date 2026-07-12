const prisma = require('../config/database');

/**
 * Retrieves all trips with optional filters and full relations.
 * @param {{ status?: string, vehicleId?: string, driverId?: string, search?: string, date?: string }} filters
 */
const findAll = async ({ status, vehicleId, driverId, search, date } = {}) => {
  let dateFilter = undefined;
  if (date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    dateFilter = {
      gte: start,
      lte: end,
    };
  }

  return prisma.trip.findMany({
    where: {
      ...(status    && { status }),
      ...(vehicleId && { vehicleId }),
      ...(driverId  && { driverId }),
      ...(dateFilter && { plannedDate: dateFilter }),
      ...(search    && {
        OR: [
          { tripNumber:  { contains: search, mode: 'insensitive' } },
          { source:      { contains: search, mode: 'insensitive' } },
          { destination: { contains: search, mode: 'insensitive' } },
          {
            vehicle: {
              OR: [
                { registrationNumber: { contains: search, mode: 'insensitive' } },
                { vehicleName:        { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            driver: {
              fullName: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      }),
    },
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Finds a trip by its primary key.
 * @param {string} id
 */
const findById = async (id) => {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

/**
 * Finds a trip by trip number.
 * @param {string} tripNumber
 */
const findByTripNumber = async (tripNumber) => {
  return prisma.trip.findUnique({
    where: { tripNumber },
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

/**
 * Creates a new trip record.
 * @param {object} data
 */
const create = async (data) => {
  return prisma.trip.create({
    data,
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

/**
 * Updates a trip by ID.
 * @param {string} id
 * @param {object} data
 */
const update = async (id, data) => {
  return prisma.trip.update({
    where: { id },
    data,
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

/**
 * Deletes a trip by ID.
 * @param {string} id
 */
const remove = async (id) => {
  return prisma.trip.delete({
    where: { id },
  });
};

/**
 * Counts total trips matching status.
 * @param {string} status
 */
const countByStatus = async (status) => {
  return prisma.trip.count({
    where: { status },
  });
};

/**
 * Checks for any active trip (status: DISPATCHED) for a vehicle.
 * @param {string} vehicleId
 */
const findActiveTripsForVehicle = async (vehicleId) => {
  return prisma.trip.findMany({
    where: {
      vehicleId,
      status: 'DISPATCHED',
    },
  });
};

/**
 * Checks for any active trip (status: DISPATCHED) for a driver.
 * @param {string} driverId
 */
const findActiveTripsForDriver = async (driverId) => {
  return prisma.trip.findMany({
    where: {
      driverId,
      status: 'DISPATCHED',
    },
  });
};

/**
 * Gets the count of the highest trip numbers to calculate next incremental tripNumber.
 */
const countAll = async () => {
  return prisma.trip.count();
};

module.exports = {
  findAll,
  findById,
  findByTripNumber,
  create,
  update,
  remove,
  countByStatus,
  findActiveTripsForVehicle,
  findActiveTripsForDriver,
  countAll,
};
