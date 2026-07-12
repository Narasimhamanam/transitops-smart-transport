const expenseRepository = require('../repositories/expense.repository');
const tripRepository = require('../repositories/trip.repository');

const getAll = async (filters) => {
  return expenseRepository.findAll(filters);
};

const getById = async (id) => {
  const record = await expenseRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Expense record not found.'), { statusCode: 404 });
  }
  return record;
};

const create = async (data) => {
  const trip = await tripRepository.findById(data.tripId);
  if (!trip) {
    throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
  }
  return expenseRepository.create(data);
};

const update = async (id, data) => {
  const record = await expenseRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Expense record not found.'), { statusCode: 404 });
  }

  if (data.tripId) {
    const trip = await tripRepository.findById(data.tripId);
    if (!trip) {
      throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
    }
  }

  return expenseRepository.update(id, data);
};

const remove = async (id) => {
  const record = await expenseRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Expense record not found.'), { statusCode: 404 });
  }
  return expenseRepository.remove(id);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
