const tripRepository = require('../repositories/trip.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const driverRepository = require('../repositories/driver.repository');

const TRIP_EDITABLE_FIELDS = ['source', 'destination', 'plannedDistance', 'cargoWeight', 'plannedDate', 'notes', 'vehicleId', 'driverId'];

/**
 * Auto-generates a unique sequential trip number.
 */
const generateTripNumber = async () => {
  const count = await tripRepository.countAll();
  const nextNum = 1001 + count;
  return `TRP-${nextNum}`;
};

const getAll = async (filters) => {
  return tripRepository.findAll(filters);
};

const getById = async (id) => {
  const trip = await tripRepository.findById(id);
  if (!trip) {
    throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
  }
  return trip;
};

const create = async (data) => {
  const vehicle = await vehicleRepository.findById(data.vehicleId);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }

  const driver = await driverRepository.findById(data.driverId);
  if (!driver) {
    throw Object.assign(new Error('Driver not found.'), { statusCode: 404 });
  }

  // Validate Cargo Weight against Vehicle Capacity
  if (data.cargoWeight > vehicle.maxLoadCapacity) {
    throw Object.assign(
      new Error(`Cargo weight (${data.cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg).`),
      { statusCode: 400 }
    );
  }

  // Auto-generate sequential trip number
  const tripNumber = await generateTripNumber();

  // If created as DISPATCHED directly, validate status and update vehicle/driver
  let startData = {};
  if (data.status === 'DISPATCHED') {
    if (vehicle.status !== 'AVAILABLE') {
      throw Object.assign(new Error(`Vehicle is currently ${vehicle.status.toLowerCase().replace('_', ' ')} and cannot be dispatched.`), { statusCode: 400 });
    }
    if (driver.status !== 'AVAILABLE') {
      throw Object.assign(new Error(`Driver is currently ${driver.status.toLowerCase().replace('_', ' ')} and cannot be dispatched.`), { statusCode: 400 });
    }
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw Object.assign(new Error('Cannot dispatch: Driver license is expired.'), { statusCode: 400 });
    }

    await vehicleRepository.update(vehicle.id, { status: 'ON_TRIP' });
    await driverRepository.update(driver.id, { status: 'ON_TRIP' });
    startData = {
      actualStartTime: new Date(),
    };
  } else if (data.status && data.status !== 'DRAFT') {
    throw Object.assign(new Error('Initial trip status must be DRAFT or DISPATCHED.'), { statusCode: 400 });
  }

  return tripRepository.create({
    ...data,
    tripNumber,
    ...startData,
  });
};

const update = async (id, data) => {
  const trip = await tripRepository.findById(id);
  if (!trip) {
    throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
  }

  // If trip is not DRAFT, block changing trip details (only allow status changes)
  if (trip.status !== 'DRAFT') {
    const attemptedEdits = TRIP_EDITABLE_FIELDS.filter((f) => data[f] !== undefined && data[f] !== trip[f]);
    if (attemptedEdits.length > 0) {
      throw Object.assign(
        new Error(`Cannot edit details of a trip that is already ${trip.status.toLowerCase()}. Only status updates are allowed.`),
        { statusCode: 400 }
      );
    }
  }

  // If status transitions are defined, handle business lifecycle
  if (data.status && data.status !== trip.status) {
    const prev = trip.status;
    const next = data.status;

    // Allowed status transitions:
    // DRAFT -> DISPATCHED, DRAFT -> CANCELLED
    // DISPATCHED -> COMPLETED, DISPATCHED -> CANCELLED
    // COMPLETED / CANCELLED -> none (terminal states)
    if (prev === 'COMPLETED' || prev === 'CANCELLED') {
      throw Object.assign(new Error(`Cannot transition from terminal state: ${prev}`), { statusCode: 400 });
    }

    if (prev === 'DISPATCHED' && next === 'DRAFT') {
      throw Object.assign(new Error('Cannot revert a dispatched trip back to draft.'), { statusCode: 400 });
    }

    // Load active vehicle/driver configurations
    const vehicle = await vehicleRepository.findById(trip.vehicleId);
    const driver = await driverRepository.findById(trip.driverId);

    if (next === 'DISPATCHED') {
      // DRAFT -> DISPATCHED
      if (vehicle.status !== 'AVAILABLE') {
        throw Object.assign(new Error(`Vehicle is currently ${vehicle.status.toLowerCase().replace('_', ' ')} and cannot be dispatched.`), { statusCode: 400 });
      }
      if (driver.status !== 'AVAILABLE') {
        throw Object.assign(new Error(`Driver is currently ${driver.status.toLowerCase().replace('_', ' ')} and cannot be dispatched.`), { statusCode: 400 });
      }
      if (new Date(driver.licenseExpiry) < new Date()) {
        throw Object.assign(new Error('Cannot dispatch: Driver license is expired.'), { statusCode: 400 });
      }
      if (trip.cargoWeight > vehicle.maxLoadCapacity) {
        throw Object.assign(new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} kg).`), { statusCode: 400 });
      }

      await vehicleRepository.update(vehicle.id, { status: 'ON_TRIP' });
      await driverRepository.update(driver.id, { status: 'ON_TRIP' });
      data.actualStartTime = new Date();
    } else if (next === 'COMPLETED') {
      // DISPATCHED -> COMPLETED
      await vehicleRepository.update(vehicle.id, { status: 'AVAILABLE' });
      await driverRepository.update(driver.id, { status: 'AVAILABLE' });
      data.actualEndTime = new Date();
    } else if (next === 'CANCELLED') {
      // Restore vehicle/driver to AVAILABLE if the trip was actively DISPATCHED
      if (prev === 'DISPATCHED') {
        await vehicleRepository.update(vehicle.id, { status: 'AVAILABLE' });
        await driverRepository.update(driver.id, { status: 'AVAILABLE' });
      }
    }
  }

  // Handle updates to draft details: make sure constraints are respected if cargo weight or driver/vehicle is changed
  if (trip.status === 'DRAFT') {
    const targetVehicleId = data.vehicleId || trip.vehicleId;
    const targetDriverId  = data.driverId || trip.driverId;
    const targetCargoWeight = data.cargoWeight || trip.cargoWeight;

    const vehicle = await vehicleRepository.findById(targetVehicleId);
    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
    }

    if (targetCargoWeight > vehicle.maxLoadCapacity) {
      throw Object.assign(
        new Error(`Cargo weight (${targetCargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg).`),
        { statusCode: 400 }
      );
    }

    const driver = await driverRepository.findById(targetDriverId);
    if (!driver) {
      throw Object.assign(new Error('Driver not found.'), { statusCode: 404 });
    }
  }

  return tripRepository.update(id, data);
};

const remove = async (id) => {
  const trip = await tripRepository.findById(id);
  if (!trip) {
    throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
  }

  // Only DRAFT and CANCELLED trips can be deleted
  if (trip.status === 'DISPATCHED' || trip.status === 'COMPLETED') {
    throw Object.assign(
      new Error(`Cannot delete a trip with status: ${trip.status.toLowerCase()}.`),
      { statusCode: 400 }
    );
  }

  return tripRepository.remove(id);
};

const dispatchTrip = async (id) => {
  return update(id, { status: 'DISPATCHED' });
};

const completeTrip = async (id) => {
  return update(id, { status: 'COMPLETED' });
};

const cancelTrip = async (id) => {
  return update(id, { status: 'CANCELLED' });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
