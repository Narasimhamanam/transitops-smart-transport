const tripService = require('../services/trip.service');
const { successResponse } = require('../utils/response.util');

const create = async (req, res) => {
  const trip = await tripService.create(req.body);
  return successResponse(res, trip, 'Trip created successfully.', 201);
};

const findAll = async (req, res) => {
  const { status, vehicleId, driverId, search, date } = req.query;
  const trips = await tripService.getAll({ status, vehicleId, driverId, search, date });
  return successResponse(res, trips, 'Trips retrieved successfully.');
};

const findById = async (req, res) => {
  const trip = await tripService.getById(req.params.id);
  return successResponse(res, trip, 'Trip retrieved successfully.');
};

const update = async (req, res) => {
  const trip = await tripService.update(req.params.id, req.body);
  return successResponse(res, trip, 'Trip updated successfully.');
};

const remove = async (req, res) => {
  await tripService.remove(req.params.id);
  return successResponse(res, null, 'Trip deleted successfully.');
};

const dispatchTrip = async (req, res) => {
  const trip = await tripService.dispatchTrip(req.params.id);
  return successResponse(res, trip, 'Trip dispatched successfully.');
};

const completeTrip = async (req, res) => {
  const trip = await tripService.completeTrip(req.params.id);
  return successResponse(res, trip, 'Trip completed successfully.');
};

const cancelTrip = async (req, res) => {
  const trip = await tripService.cancelTrip(req.params.id);
  return successResponse(res, trip, 'Trip cancelled successfully.');
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
