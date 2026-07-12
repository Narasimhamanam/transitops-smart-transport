const fuelRepository = require('../repositories/fuel.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const tripRepository = require('../repositories/trip.repository');

const getAll = async (filters) => {
  return fuelRepository.findAll(filters);
};

const getById = async (id) => {
  const record = await fuelRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Fuel log record not found.'), { statusCode: 404 });
  }
  return record;
};

const create = async (data) => {
  const vehicle = await vehicleRepository.findById(data.vehicleId);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }

  // Odometer reading validation
  if (data.odometerReading < vehicle.odometer) {
    throw Object.assign(
      new Error(`New odometer reading (${data.odometerReading} km) cannot be less than the vehicle's current odometer reading (${vehicle.odometer} km).`),
      { statusCode: 400 }
    );
  }

  if (data.tripId) {
    const trip = await tripRepository.findById(data.tripId);
    if (!trip) {
      throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
    }
  }

  // Auto calculate totalCost
  const totalCost = data.liters * data.pricePerLiter;

  const log = await fuelRepository.create({
    ...data,
    totalCost,
  });

  // Update vehicle's current odometer reading
  await vehicleRepository.update(vehicle.id, { odometer: data.odometerReading });

  return log;
};

const update = async (id, data) => {
  const record = await fuelRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Fuel log record not found.'), { statusCode: 404 });
  }

  const targetVehicleId = data.vehicleId || record.vehicleId;
  const vehicle = await vehicleRepository.findById(targetVehicleId);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }

  if (data.odometerReading !== undefined && data.odometerReading !== record.odometerReading) {
    // If updating, make sure the new odometer is not less than the original vehicle odometer (before this entry's update)
    // The previous vehicle odometer is stored, but let's just make sure it doesn't decrease overall.
    // E.g., block if the new odometer is less than current vehicle odometer except if we are modifying the latest entry.
    // To keep it simple: new odometer reading cannot decrease below the vehicle's current reading minus this log's reading
    const diffLimit = vehicle.odometer - record.odometerReading;
    if (data.odometerReading < diffLimit) {
      throw Object.assign(
        new Error(`Updated odometer reading (${data.odometerReading} km) would decrease vehicle odometer below historical minimum (${diffLimit} km).`),
        { statusCode: 400 }
      );
    }
  }

  // Auto calculate totalCost
  const liters = data.liters !== undefined ? data.liters : record.liters;
  const price = data.pricePerLiter !== undefined ? data.pricePerLiter : record.pricePerLiter;
  const totalCost = liters * price;

  const updatedLog = await fuelRepository.update(id, {
    ...data,
    totalCost,
  });

  // Update vehicle odometer if it is larger than current
  const newOdo = data.odometerReading !== undefined ? data.odometerReading : record.odometerReading;
  if (newOdo > vehicle.odometer) {
    await vehicleRepository.update(vehicle.id, { odometer: newOdo });
  }

  return updatedLog;
};

const remove = async (id) => {
  const record = await fuelRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Fuel log record not found.'), { statusCode: 404 });
  }
  return fuelRepository.remove(id);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
