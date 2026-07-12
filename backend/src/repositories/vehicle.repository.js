const prisma = require('../config/database');

/**
 * Retrieves all vehicles with optional filters.
 * @param {{ status?: string, vehicleType?: string, search?: string }} filters
 */
const findAll = async ({ status, vehicleType, search } = {}) => {
  return prisma.vehicle.findMany({
    where: {
      ...(status      && { status }),
      ...(vehicleType && { vehicleType }),
      ...(search      && {
        OR: [
          { vehicleName:        { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Finds a vehicle by its primary key.
 * @param {string} id
 */
const findById = async (id) => {
  return prisma.vehicle.findUnique({ where: { id } });
};

/**
 * Finds a vehicle by registration number.
 * @param {string} registrationNumber
 */
const findByRegistration = async (registrationNumber) => {
  return prisma.vehicle.findUnique({ where: { registrationNumber } });
};

/**
 * Creates a new vehicle record.
 * @param {object} data
 */
const create = async (data) => {
  return prisma.vehicle.create({ data });
};

/**
 * Updates a vehicle by ID.
 * @param {string} id
 * @param {object} data
 */
const update = async (id, data) => {
  return prisma.vehicle.update({ where: { id }, data });
};

/**
 * Deletes a vehicle by ID.
 * @param {string} id
 */
const remove = async (id) => {
  return prisma.vehicle.delete({ where: { id } });
};

module.exports = { findAll, findById, findByRegistration, create, update, remove };
