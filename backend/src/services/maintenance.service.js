const maintenanceRepository = require('../repositories/maintenance.repository');
const vehicleRepository = require('../repositories/vehicle.repository');

const generateMaintenanceNumber = async () => {
  const count = await maintenanceRepository.countAll();
  const nextNum = 1001 + count;
  return `MNT-${nextNum}`;
};

const getAll = async (filters) => {
  return maintenanceRepository.findAll(filters);
};

const getById = async (id) => {
  const record = await maintenanceRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Maintenance record not found.'), { statusCode: 404 });
  }
  return record;
};

const create = async (data) => {
  const vehicle = await vehicleRepository.findById(data.vehicleId);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found.'), { statusCode: 404 });
  }

  // Vehicles already ON_TRIP cannot be scheduled/submitted for maintenance
  if (vehicle.status === 'ON_TRIP') {
    throw Object.assign(
      new Error(`Vehicle '${vehicle.registrationNumber}' is currently on a trip and cannot be scheduled for maintenance.`),
      { statusCode: 400 }
    );
  }

  const maintenanceNumber = await generateMaintenanceNumber();

  // If created as IN_PROGRESS directly, update vehicle status to IN_SHOP
  if (data.status === 'IN_PROGRESS') {
    await vehicleRepository.update(vehicle.id, { status: 'IN_SHOP' });
  }

  return maintenanceRepository.create({
    ...data,
    maintenanceNumber,
  });
};

const update = async (id, data) => {
  const record = await maintenanceRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Maintenance record not found.'), { statusCode: 404 });
  }

  // Block modifications if already COMPLETED or CANCELLED
  if (record.status === 'COMPLETED' || record.status === 'CANCELLED') {
    throw Object.assign(
      new Error(`Cannot update a maintenance record that is already ${record.status.toLowerCase()}.`),
      { statusCode: 400 }
    );
  }

  // Handle status transitions
  if (data.status && data.status !== record.status) {
    const prev = record.status;
    const next = data.status;
    const vehicle = await vehicleRepository.findById(record.vehicleId);

    if (next === 'IN_PROGRESS') {
      // SCHEDULED -> IN_PROGRESS
      if (vehicle.status === 'ON_TRIP') {
        throw Object.assign(
          new Error(`Vehicle '${vehicle.registrationNumber}' is currently on a trip and cannot enter maintenance.`),
          { statusCode: 400 }
        );
      }
      await vehicleRepository.update(vehicle.id, { status: 'IN_SHOP' });
    } else if (next === 'COMPLETED') {
      // IN_PROGRESS -> COMPLETED (or directly from SCHEDULED)
      await vehicleRepository.update(vehicle.id, { status: 'AVAILABLE' });
      data.completedDate = data.completedDate || new Date();
    } else if (next === 'CANCELLED') {
      // If was IN_PROGRESS (IN_SHOP), restore vehicle status to AVAILABLE
      if (prev === 'IN_PROGRESS') {
        await vehicleRepository.update(vehicle.id, { status: 'AVAILABLE' });
      }
    }
  }

  return maintenanceRepository.update(id, data);
};

const remove = async (id) => {
  const record = await maintenanceRepository.findById(id);
  if (!record) {
    throw Object.assign(new Error('Maintenance record not found.'), { statusCode: 404 });
  }

  if (record.status === 'IN_PROGRESS' || record.status === 'COMPLETED') {
    throw Object.assign(
      new Error(`Cannot delete active or completed maintenance logs. (Status: ${record.status.toLowerCase()}).`),
      { statusCode: 400 }
    );
  }

  return maintenanceRepository.remove(id);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
