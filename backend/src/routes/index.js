const { Router } = require('express');
const authRoutes          = require('./auth.routes');
const vehicleRoutes       = require('./vehicle.routes');
const driverRoutes        = require('./driver.routes');
const tripRoutes          = require('./trip.routes');
const dashboardRoutes     = require('./dashboard.routes');
const maintenanceRoutes  = require('./maintenance.routes');
const fuelRoutes          = require('./fuel.routes');
const expenseRoutes       = require('./expense.routes');
const aiRoutes            = require('./ai.routes');
const notificationRoutes  = require('./notification.routes');

const router = Router();

router.use('/auth',          authRoutes);
router.use('/vehicles',      vehicleRoutes);
router.use('/drivers',       driverRoutes);
router.use('/trips',         tripRoutes);
router.use('/dashboard',     dashboardRoutes);
router.use('/maintenances',  maintenanceRoutes);
router.use('/fuel-logs',     fuelRoutes);
router.use('/expenses',      expenseRoutes);
router.use('/ai',            aiRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
