const { Router } = require('express');
const expenseController = require('../controllers/expense.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expense.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(createExpenseSchema), expenseController.create);
router.get(   '/',                                   expenseController.findAll);
router.get(   '/:id',                                expenseController.findById);
router.put(   '/:id', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),                                expenseController.remove);

module.exports = router;
