const { z } = require('zod');

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'EB', 'EC'];
const DRIVER_STATUSES    = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];

const createDriverSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters')
    .trim(),
  licenseNumber: z
    .string({ required_error: 'License number is required' })
    .min(3, 'License number must be at least 3 characters')
    .max(30, 'License number must be under 30 characters')
    .trim()
    .toUpperCase(),
  licenseCategory: z.enum(LICENSE_CATEGORIES, {
    required_error: 'License category is required',
    invalid_type_error: `License category must be one of: ${LICENSE_CATEGORIES.join(', ')}`,
  }),
  licenseExpiry: z
    .string({ required_error: 'License expiry date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'License expiry must be a valid date (YYYY-MM-DD)' })
    .transform((val) => new Date(val)),
  contactNumber: z
    .string({ required_error: 'Contact number is required' })
    .min(7, 'Contact number must be at least 7 characters')
    .max(20, 'Contact number must be under 20 characters')
    .trim(),
  safetyScore: z
    .number({ invalid_type_error: 'Safety score must be a number' })
    .int('Safety score must be an integer')
    .min(0, 'Safety score cannot be less than 0')
    .max(100, 'Safety score cannot exceed 100')
    .optional()
    .default(100),
  status: z.enum(DRIVER_STATUSES).optional().default('AVAILABLE'),
});

const updateDriverSchema = z.object({
  fullName:        z.string().min(2).max(100).trim().optional(),
  licenseNumber:   z.string().min(3).max(30).trim().toUpperCase().optional(),
  licenseCategory: z.enum(LICENSE_CATEGORIES).optional(),
  licenseExpiry: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'License expiry must be a valid date' })
    .transform((val) => new Date(val))
    .optional(),
  contactNumber:   z.string().min(7).max(20).trim().optional(),
  safetyScore: z
    .number()
    .int()
    .min(0, 'Safety score cannot be less than 0')
    .max(100, 'Safety score cannot exceed 100')
    .optional(),
  status: z.enum(DRIVER_STATUSES).optional(),
});

module.exports = { createDriverSchema, updateDriverSchema };
