const { Router } = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createMaintenanceSchema, updateMaintenanceSchema } = require('../validators/maintenance.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FLEET_MANAGER'), validate(createMaintenanceSchema), maintenanceController.create);
router.get(   '/',                                       maintenanceController.findAll);
router.get(   '/:id',                                    maintenanceController.findById);
router.put(   '/:id', authorize('FLEET_MANAGER'), validate(updateMaintenanceSchema), maintenanceController.update);
router.delete('/:id', authorize('FLEET_MANAGER'),                                    maintenanceController.remove);

module.exports = router;
