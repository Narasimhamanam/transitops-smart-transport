const fuelService = require('../services/fuel.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const log = await fuelService.create(req.body);
  return successResponse(res, log, 'Fuel log added successfully.', 201);
};

const findAll = async (req, res) => {
  const { vehicleId, search } = req.query;
  const logs = await fuelService.getAll({ vehicleId, search });
  return successResponse(res, logs, 'Fuel logs retrieved successfully.');
};

const findById = async (req, res) => {
  const log = await fuelService.getById(req.params.id);
  return successResponse(res, log, 'Fuel log retrieved successfully.');
};

const update = async (req, res) => {
  const log = await fuelService.update(req.params.id, req.body);
  return successResponse(res, log, 'Fuel log updated successfully.');
};

const remove = async (req, res) => {
  await fuelService.remove(req.params.id);
  return successResponse(res, null, 'Fuel log deleted successfully.');
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};
