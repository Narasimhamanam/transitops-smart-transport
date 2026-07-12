const { Router } = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createMaintenanceSchema, updateMaintenanceSchema } = require('../validators/maintenance.validator');

const router = Router();

router.use(authenticate);

// Only Fleet Manager can write maintenance records
router.post(  '/',    authorize('FLEET_MANAGER'), validate(createMaintenanceSchema), maintenanceController.create);
router.put(   '/:id', authorize('FLEET_MANAGER'), validate(updateMaintenanceSchema), maintenanceController.update);
router.delete('/:id', authorize('FLEET_MANAGER'),                                    maintenanceController.remove);

// Fleet Manager can read maintenance records
router.get(   '/',    authorize('FLEET_MANAGER'), maintenanceController.findAll);
router.get(   '/:id', authorize('FLEET_MANAGER'), maintenanceController.findById);

module.exports = router;
