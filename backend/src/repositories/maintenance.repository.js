const prisma = require('../config/database');

const findAll = async ({ status, vehicleId, search } = {}) => {
  return prisma.maintenance.findMany({
    where: {
      ...(status    && { status }),
      ...(vehicleId && { vehicleId }),
      ...(search    && {
        OR: [
          { maintenanceNumber: { contains: search, mode: 'insensitive' } },
          { maintenanceType:   { contains: search, mode: 'insensitive' } },
          { serviceCenter:     { contains: search, mode: 'insensitive' } },
          { vehicle: { registrationNumber: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      vehicle: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id) => {
  return prisma.maintenance.findUnique({
    where: { id },
    include: { vehicle: true },
  });
};

const findByMaintenanceNumber = async (maintenanceNumber) => {
  return prisma.maintenance.findUnique({
    where: { maintenanceNumber },
    include: { vehicle: true },
  });
};

const create = async (data) => {
  return prisma.maintenance.create({
    data,
    include: { vehicle: true },
  });
};

const update = async (id, data) => {
  return prisma.maintenance.update({
    where: { id },
    data,
    include: { vehicle: true },
  });
};

const remove = async (id) => {
  return prisma.maintenance.delete({ where: { id } });
};

const countAll = async () => {
  return prisma.maintenance.count();
};

const sumMaintenanceCost = async () => {
  const aggregate = await prisma.maintenance.aggregate({
    _sum: {
      actualCost: true,
      estimatedCost: true,
    },
    where: {
      status: 'COMPLETED',
    },
  });
  return aggregate._sum.actualCost || aggregate._sum.estimatedCost || 0;
};

module.exports = {
  findAll,
  findById,
  findByMaintenanceNumber,
  create,
  update,
  remove,
  countAll,
  sumMaintenanceCost,
};
