const { z } = require('zod');

const EXPENSE_TYPES = ['TOLL', 'FOOD', 'REPAIR', 'PARKING', 'MISCELLANEOUS'];

const createExpenseSchema = z.object({
  tripId: z.string({ required_error: 'Trip ID is required' }).min(1, 'Trip is required'),
  expenseType: z.enum(EXPENSE_TYPES, {
    required_error: 'Expense type is required',
    invalid_type_error: `Expense type must be one of: ${EXPENSE_TYPES.join(', ')}`,
  }),
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  description: z.string({ required_error: 'Description is required' }).min(3, 'Description is too short').max(200).trim(),
  expenseDate: z.string({ required_error: 'Expense date is required' })
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
    .transform((v) => new Date(v)),
});

const updateExpenseSchema = z.object({
  tripId: z.string().optional(),
  expenseType: z.enum(EXPENSE_TYPES).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(3).max(200).trim().optional(),
  expenseDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').transform((v) => new Date(v)).optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };
