const { Router } = require('express');
const fuelController = require('../controllers/fuel.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createFuelLogSchema, updateFuelLogSchema } = require('../validators/fuel.validator');

const router = Router();

// Financial Analyst manages fuel logs
const FUEL_ROLES = ['FINANCIAL_ANALYST'];

router.use(authenticate);

router.post(  '/',    authorize(...FUEL_ROLES), validate(createFuelLogSchema), fuelController.create);
router.get(   '/',    authorize(...FUEL_ROLES), fuelController.findAll);
router.get(   '/:id', authorize(...FUEL_ROLES), fuelController.findById);
router.put(   '/:id', authorize(...FUEL_ROLES), validate(updateFuelLogSchema), fuelController.update);
router.delete('/:id', authorize(...FUEL_ROLES), fuelController.remove);

module.exports = router;
