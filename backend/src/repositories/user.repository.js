const prisma = require('../config/database');

/**
 * Find a user by email (includes password for auth checks).
 * @param {string} email
 */
const findByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * Find a user by ID (excludes password).
 * @param {string} id
 */
const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Create a new user.
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
const create = async (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Update a user by ID.
 * @param {string} id
 * @param {object} data
 */
const update = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

module.exports = { findByEmail, findById, create, update };
