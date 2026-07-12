const { Router } = require('express');
const tripController = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createTripSchema, updateTripSchema } = require('../validators/trip.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',          authorize('FLEET_MANAGER', 'DISPATCHER'), validate(createTripSchema), tripController.create);
router.get(   '/',                                      tripController.findAll);
router.get(   '/:id',                                   tripController.findById);
router.put(   '/:id',       authorize('FLEET_MANAGER', 'DISPATCHER'), validate(updateTripSchema), tripController.update);
router.delete('/:id',       authorize('FLEET_MANAGER', 'DISPATCHER'),                               tripController.remove);

router.post(  '/:id/dispatch', authorize('FLEET_MANAGER', 'DISPATCHER'),                          tripController.dispatchTrip);
router.post(  '/:id/complete', authorize('FLEET_MANAGER', 'DISPATCHER'),                          tripController.completeTrip);
router.post(  '/:id/cancel',   authorize('FLEET_MANAGER', 'DISPATCHER'),                          tripController.cancelTrip);

module.exports = router;
