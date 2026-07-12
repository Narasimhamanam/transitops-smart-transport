const expenseService = require('../services/expense.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const expense = await expenseService.create(req.body);
  return successResponse(res, expense, 'Expense tracked successfully.', 201);
};

const findAll = async (req, res) => {
  const { tripId, search } = req.query;
  const expenses = await expenseService.getAll({ tripId, search });
  return successResponse(res, expenses, 'Expenses retrieved successfully.');
};

const findById = async (req, res) => {
  const expense = await expenseService.getById(req.params.id);
  return successResponse(res, expense, 'Expense retrieved successfully.');
};

const update = async (req, res) => {
  const expense = await expenseService.update(req.params.id, req.body);
  return successResponse(res, expense, 'Expense updated successfully.');
};

const remove = async (req, res) => {
  await expenseService.remove(req.params.id);
  return successResponse(res, null, 'Expense deleted successfully.');
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};
