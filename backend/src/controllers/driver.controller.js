const driverService = require('../services/driver.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const driver = await driverService.create(req.body);
  return successResponse(res, driver, 'Driver created successfully.', 201);
};

const findAll = async (req, res) => {
  const { status, licenseCategory, search } = req.query;
  const drivers = await driverService.getAll({ status, licenseCategory, search });
  return successResponse(res, drivers, 'Drivers retrieved successfully.');
};

const findById = async (req, res) => {
  const driver = await driverService.getById(req.params.id);
  return successResponse(res, driver, 'Driver retrieved successfully.');
};

const update = async (req, res) => {
  const driver = await driverService.update(req.params.id, req.body);
  return successResponse(res, driver, 'Driver updated successfully.');
};

const remove = async (req, res) => {
  await driverService.remove(req.params.id);
  return successResponse(res, null, 'Driver deleted successfully.');
};

module.exports = { create, findAll, findById, update, remove };
