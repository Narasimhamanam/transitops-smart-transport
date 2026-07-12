const prisma = require('../config/database');

/**
 * Retrieves all drivers with optional filters.
 * @param {{ status?: string, licenseCategory?: string, search?: string }} filters
 */
const findAll = async ({ status, licenseCategory, search } = {}) => {
  return prisma.driver.findMany({
    where: {
      ...(status          && { status }),
      ...(licenseCategory && { licenseCategory }),
      ...(search          && {
        OR: [
          { fullName:      { contains: search, mode: 'insensitive' } },
          { licenseNumber: { contains: search, mode: 'insensitive' } },
          { contactNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Finds a driver by primary key.
 * @param {string} id
 */
const findById = async (id) => {
  return prisma.driver.findUnique({ where: { id } });
};

/**
 * Finds a driver by license number.
 * @param {string} licenseNumber
 */
const findByLicense = async (licenseNumber) => {
  return prisma.driver.findUnique({ where: { licenseNumber } });
};

/**
 * Creates a new driver record.
 * @param {object} data
 */
const create = async (data) => {
  return prisma.driver.create({ data });
};

/**
 * Updates a driver by ID.
 * @param {string} id
 * @param {object} data
 */
const update = async (id, data) => {
  return prisma.driver.update({ where: { id }, data });
};

/**
 * Deletes a driver by ID.
 * @param {string} id
 */
const remove = async (id) => {
  return prisma.driver.delete({ where: { id } });
};

module.exports = { findAll, findById, findByLicense, create, update, remove };
