const vehicleRepository = require('../repositories/vehicle.repository');

const RETIRED_LOCKED_FIELDS = ['registrationNumber', 'vehicleName', 'vehicleType', 'maxLoadCapacity', 'odometer', 'acquisitionCost'];

const getAll = async (filters) => {
  return vehicleRepository.findAll(filters);
};

const getById = async (id) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }
  return vehicle;
};

const create = async (data) => {
  const existing = await vehicleRepository.findByRegistration(data.registrationNumber);
  if (existing) {
    throw Object.assign(
      new Error(`A vehicle with registration number '${data.registrationNumber}' already exists.`),
      { statusCode: 409 }
    );
  }
  return vehicleRepository.create(data);
};

const update = async (id, data) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }

  if (vehicle.status === 'RETIRED') {
    const lockedFields = RETIRED_LOCKED_FIELDS.filter((f) => data[f] !== undefined);
    if (lockedFields.length > 0) {
      throw Object.assign(
        new Error(`Retired vehicles cannot be edited. Only status changes are allowed. Locked fields: ${lockedFields.join(', ')}.`),
        { statusCode: 400 }
      );
    }
  }

  if (data.registrationNumber && data.registrationNumber !== vehicle.registrationNumber) {
    const duplicate = await vehicleRepository.findByRegistration(data.registrationNumber);
    if (duplicate) {
      throw Object.assign(
        new Error(`A vehicle with registration number '${data.registrationNumber}' already exists.`),
        { statusCode: 409 }
      );
    }
  }

  return vehicleRepository.update(id, data);
};

const remove = async (id) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }
  if (vehicle.status === 'ON_TRIP') {
    throw Object.assign(
      new Error('Cannot delete a vehicle that is currently on a trip.'),
      { statusCode: 400 }
    );
  }
  return vehicleRepository.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
