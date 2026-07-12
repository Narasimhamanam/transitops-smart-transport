const { Router } = require('express');
const driverController = require('../controllers/driver.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createDriverSchema, updateDriverSchema } = require('../validators/driver.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    validate(createDriverSchema), driverController.create);
router.get(   '/',                                  driverController.findAll);
router.get(   '/:id',                               driverController.findById);
router.put(   '/:id', validate(updateDriverSchema), driverController.update);
router.delete('/:id',                               driverController.remove);

module.exports = router;
