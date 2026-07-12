const { Router } = require('express');
const tripController = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createTripSchema, updateTripSchema } = require('../validators/trip.validator');

const router = Router();

router.use(authenticate);

// Only Driver (DISPATCHER) can write trip data
const WRITE_ROLES = ['DISPATCHER'];
router.post(  '/',          authorize(...WRITE_ROLES), validate(createTripSchema), tripController.create);
router.put(   '/:id',       authorize(...WRITE_ROLES), validate(updateTripSchema), tripController.update);
router.delete('/:id',       authorize(...WRITE_ROLES),                             tripController.remove);

router.post(  '/:id/dispatch', authorize(...WRITE_ROLES), tripController.dispatchTrip);
router.post(  '/:id/complete', authorize(...WRITE_ROLES), tripController.completeTrip);
router.post(  '/:id/cancel',   authorize(...WRITE_ROLES), tripController.cancelTrip);

// Only Driver (DISPATCHER) can read trip data
router.get(   '/',                                    authorize('DISPATCHER'), tripController.findAll);
router.get(   '/:id',                                 authorize('DISPATCHER'), tripController.findById);

module.exports = router;
