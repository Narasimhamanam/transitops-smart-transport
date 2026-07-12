const { Router } = require('express');
const authRoutes    = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const driverRoutes  = require('./driver.routes');

const router = Router();

router.use('/auth',     authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers',  driverRoutes);

module.exports = router;
