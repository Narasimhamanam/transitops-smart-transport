const vehicleService = require('../services/vehicle.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const vehicle = await vehicleService.create(req.body);
  return successResponse(res, vehicle, 'Vehicle created successfully.', 201);
};

const findAll = async (req, res) => {
  const { status, vehicleType, search } = req.query;
  const vehicles = await vehicleService.getAll({ status, vehicleType, search });
  return successResponse(res, vehicles, 'Vehicles retrieved successfully.');
};

const findById = async (req, res) => {
  const vehicle = await vehicleService.getById(req.params.id);
  return successResponse(res, vehicle, 'Vehicle retrieved successfully.');
};

const update = async (req, res) => {
  const vehicle = await vehicleService.update(req.params.id, req.body);
  return successResponse(res, vehicle, 'Vehicle updated successfully.');
};

const remove = async (req, res) => {
  await vehicleService.remove(req.params.id);
  return successResponse(res, null, 'Vehicle deleted successfully.');
};

module.exports = { create, findAll, findById, update, remove };
