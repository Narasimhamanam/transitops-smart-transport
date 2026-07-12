const { Router } = require('express');
const fuelController = require('../controllers/fuel.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createFuelLogSchema, updateFuelLogSchema } = require('../validators/fuel.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FLEET_MANAGER', 'DISPATCHER'), validate(createFuelLogSchema), fuelController.create);
router.get(   '/',                                   fuelController.findAll);
router.get(   '/:id',                                fuelController.findById);
router.put(   '/:id', authorize('FLEET_MANAGER', 'DISPATCHER'), validate(updateFuelLogSchema), fuelController.update);
router.delete('/:id', authorize('FLEET_MANAGER', 'DISPATCHER'),                                fuelController.remove);

module.exports = router;
