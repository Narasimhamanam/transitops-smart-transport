const { Router } = require('express');
const driverController = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createDriverSchema, updateDriverSchema } = require('../validators/driver.validator');

const router = Router();

router.use(authenticate);

// Only Fleet Manager can create or delete drivers
router.post(  '/',    authorize('FLEET_MANAGER'), validate(createDriverSchema), driverController.create);
router.delete('/:id', authorize('FLEET_MANAGER'), driverController.remove);

// Safety Officer can update safety score/status, Fleet Manager can update any field
router.put(   '/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), validate(updateDriverSchema), driverController.update);

// Fleet Manager, Safety Officer, and Driver (DISPATCHER) can read drivers (Driver needs it for trip assignment)
router.get(   '/',    authorize('FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'), driverController.findAll);
router.get(   '/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'), driverController.findById);

module.exports = router;
