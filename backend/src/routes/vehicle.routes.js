const { Router } = require('express');
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createVehicleSchema, updateVehicleSchema } = require('../validators/vehicle.validator');

const router = Router();

router.use(authenticate);

// Only Fleet Manager can write vehicle data
router.post(  '/',    authorize('FLEET_MANAGER'), validate(createVehicleSchema), vehicleController.create);
router.put(   '/:id', authorize('FLEET_MANAGER'), validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authorize('FLEET_MANAGER'), vehicleController.remove);

// Fleet Manager and Driver (DISPATCHER) can read vehicles
router.get(   '/',    authorize('FLEET_MANAGER', 'DISPATCHER'), vehicleController.findAll);
router.get(   '/:id', authorize('FLEET_MANAGER', 'DISPATCHER'), vehicleController.findById);

module.exports = router;
