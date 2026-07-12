const prisma = require('../config/database');

const findAll = async ({ tripId, search } = {}) => {
  return prisma.expense.findMany({
    where: {
      ...(tripId && { tripId }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { expenseType: { equals: search.toUpperCase() } },
          { trip: { tripNumber: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      trip: true,
    },
    orderBy: { expenseDate: 'desc' },
  });
};

const findById = async (id) => {
  return prisma.expense.findUnique({
    where: { id },
    include: { trip: true },
  });
};

const create = async (data) => {
  return prisma.expense.create({
    data,
    include: { trip: true },
  });
};

const update = async (id, data) => {
  return prisma.expense.update({
    where: { id },
    data,
    include: { trip: true },
  });
};

const remove = async (id) => {
  return prisma.expense.delete({ where: { id } });
};

const sumExpenses = async () => {
  const aggregate = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });
  return aggregate._sum.amount || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  sumExpenses,
};
