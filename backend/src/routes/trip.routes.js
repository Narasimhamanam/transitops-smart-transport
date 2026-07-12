const { Router } = require('express');
const tripController = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createTripSchema, updateTripSchema } = require('../validators/trip.validator');

const router = Router();

router.use(authenticate);

// Only Fleet Manager and Driver (DISPATCHER) can write trip data
const WRITE_ROLES = ['FLEET_MANAGER', 'DISPATCHER'];
router.post(  '/',          authorize(...WRITE_ROLES), validate(createTripSchema), tripController.create);
router.put(   '/:id',       authorize(...WRITE_ROLES), validate(updateTripSchema), tripController.update);
router.delete('/:id',       authorize(...WRITE_ROLES),                             tripController.remove);

router.post(  '/:id/dispatch', authorize(...WRITE_ROLES), tripController.dispatchTrip);
router.post(  '/:id/complete', authorize(...WRITE_ROLES), tripController.completeTrip);
router.post(  '/:id/cancel',   authorize(...WRITE_ROLES), tripController.cancelTrip);

// Fleet Manager, Driver (DISPATCHER), and Financial Analyst can read trip data
router.get(   '/',                                    authorize('FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'), tripController.findAll);
router.get(   '/:id',                                 authorize('FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'), tripController.findById);

module.exports = router;
