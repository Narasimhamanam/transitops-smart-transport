const prisma = require('../config/database');

const findAll = async ({ vehicleId, search } = {}) => {
  return prisma.fuelLog.findMany({
    where: {
      ...(vehicleId && { vehicleId }),
      ...(search    && {
        OR: [
          { fuelStation: { contains: search, mode: 'insensitive' } },
          { vehicle: { registrationNumber: { contains: search, mode: 'insensitive' } } },
          { trip: { tripNumber: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      vehicle: true,
      trip: true,
    },
    orderBy: { fuelDate: 'desc' },
  });
};

const findById = async (id) => {
  return prisma.fuelLog.findUnique({
    where: { id },
    include: {
      vehicle: true,
      trip: true,
    },
  });
};

const create = async (data) => {
  return prisma.fuelLog.create({
    data,
    include: {
      vehicle: true,
      trip: true,
    },
  });
};

const update = async (id, data) => {
  return prisma.fuelLog.update({
    where: { id },
    data,
    include: {
      vehicle: true,
      trip: true,
    },
  });
};

const remove = async (id) => {
  return prisma.fuelLog.delete({ where: { id } });
};

const sumFuelCost = async () => {
  const aggregate = await prisma.fuelLog.aggregate({
    _sum: {
      totalCost: true,
    },
  });
  return aggregate._sum.totalCost || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  sumFuelCost,
};
