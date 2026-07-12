const { Router } = require('express');
const driverController = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createDriverSchema, updateDriverSchema } = require('../validators/driver.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), validate(createDriverSchema), driverController.create);
router.get(   '/',                                  driverController.findAll);
router.get(   '/:id',                               driverController.findById);
router.put(   '/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), validate(updateDriverSchema), driverController.update);
router.delete('/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'),                               driverController.remove);

module.exports = router;
