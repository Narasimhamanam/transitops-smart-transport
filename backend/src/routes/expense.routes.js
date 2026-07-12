const { Router } = require('express');
const expenseController = require('../controllers/expense.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expense.validator');

const router = Router();

router.use(authenticate);

router.post(  '/',    authorize('FINANCIAL_ANALYST'), validate(createExpenseSchema), expenseController.create);
router.get(   '/',    authorize('FINANCIAL_ANALYST'), expenseController.findAll);
router.get(   '/:id', authorize('FINANCIAL_ANALYST'), expenseController.findById);
router.put(   '/:id', authorize('FINANCIAL_ANALYST'), validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', authorize('FINANCIAL_ANALYST'), expenseController.remove);

module.exports = router;
