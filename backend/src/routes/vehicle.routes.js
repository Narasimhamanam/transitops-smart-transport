const { Router } = require('express');
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createVehicleSchema, updateVehicleSchema } = require('../validators/vehicle.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FLEET_MANAGER'), validate(createVehicleSchema), vehicleController.create);
router.get(   '/',                                   vehicleController.findAll);
router.get(   '/:id',                                vehicleController.findById);
router.put(   '/:id', authorize('FLEET_MANAGER'), validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authorize('FLEET_MANAGER'),                                vehicleController.remove);

module.exports = router;
