const maintenanceService = require('../services/maintenance.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const record = await maintenanceService.create(req.body);
  return successResponse(res, record, 'Maintenance scheduled successfully.', 201);
};

const findAll = async (req, res) => {
  const { status, vehicleId, search } = req.query;
  const records = await maintenanceService.getAll({ status, vehicleId, search });
  return successResponse(res, records, 'Maintenance logs retrieved successfully.');
};

const findById = async (req, res) => {
  const record = await maintenanceService.getById(req.params.id);
  return successResponse(res, record, 'Maintenance log retrieved successfully.');
};

const update = async (req, res) => {
  const record = await maintenanceService.update(req.params.id, req.body);
  return successResponse(res, record, 'Maintenance updated successfully.');
};

const remove = async (req, res) => {
  await maintenanceService.remove(req.params.id);
  return successResponse(res, null, 'Maintenance log deleted successfully.');
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};
