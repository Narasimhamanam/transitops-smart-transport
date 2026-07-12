const driverRepository = require('../repositories/driver.repository');

const getAll = async (filters) => {
  return driverRepository.findAll(filters);
};

const getById = async (id) => {
  const driver = await driverRepository.findById(id);
  if (!driver) {
    throw Object.assign(new Error('Driver not found.'), { statusCode: 404 });
  }
  return driver;
};

const create = async (data) => {
  const existing = await driverRepository.findByLicense(data.licenseNumber);
  if (existing) {
    throw Object.assign(
      new Error(`A driver with license number '${data.licenseNumber}' already exists.`),
      { statusCode: 409 }
    );
  }
  return driverRepository.create(data);
};

const update = async (id, data) => {
  const driver = await driverRepository.findById(id);
  if (!driver) {
    throw Object.assign(new Error('Driver not found.'), { statusCode: 404 });
  }

  if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
    const duplicate = await driverRepository.findByLicense(data.licenseNumber);
    if (duplicate) {
      throw Object.assign(
        new Error(`A driver with license number '${data.licenseNumber}' already exists.`),
        { statusCode: 409 }
      );
    }
  }

  return driverRepository.update(id, data);
};

const remove = async (id) => {
  const driver = await driverRepository.findById(id);
  if (!driver) {
    throw Object.assign(new Error('Driver not found.'), { statusCode: 404 });
  }
  if (driver.status === 'ON_TRIP') {
    throw Object.assign(
      new Error('Cannot delete a driver who is currently on a trip.'),
      { statusCode: 400 }
    );
  }
  return driverRepository.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
