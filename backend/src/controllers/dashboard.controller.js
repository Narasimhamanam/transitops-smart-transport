const prisma = require('../config/database');
const { successResponse } = require('../utils/response.util');

const getStats = async (req, res) => {
  const [
    totalVehicles,
    availableVehicles,
    vehiclesOnTrip,
    inShopVehicles,
    retiredVehicles,
    totalDrivers,
    availableDrivers,
    activeTrips,
    pendingTrips,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: {
        status: { not: 'RETIRED' }, // Exclude retired vehicles from utilization metrics
      },
    }),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: 'AVAILABLE' } }),
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
  ]);

  const utilizationRate = totalVehicles > 0 
    ? Math.round((vehiclesOnTrip / totalVehicles) * 100) 
    : 0;

  const data = {
    availableVehicles,
    vehiclesOnTrip,
    inShopVehicles,
    retiredVehicles,
    totalDrivers,
    availableDrivers,
    activeTrips,
    pendingTrips,
    fleetUtilization: utilizationRate,
  };

  return successResponse(res, data, 'Dashboard statistics retrieved successfully.');
};

module.exports = { getStats };
