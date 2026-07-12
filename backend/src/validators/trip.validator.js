const { z } = require('zod');

const TRIP_STATUSES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

const createTripSchema = z.object({
  source: z
    .string({ required_error: 'Source location is required' })
    .min(2, 'Source must be at least 2 characters')
    .max(100, 'Source must be under 100 characters')
    .trim(),
  destination: z
    .string({ required_error: 'Destination is required' })
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must be under 100 characters')
    .trim(),
  plannedDistance: z
    .number({ required_error: 'Planned distance is required', invalid_type_error: 'Planned distance must be a number' })
    .positive('Planned distance must be positive'),
  cargoWeight: z
    .number({ required_error: 'Cargo weight is required', invalid_type_error: 'Cargo weight must be a number' })
    .positive('Cargo weight must be positive'),
  plannedDate: z
    .string({ required_error: 'Planned date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Planned date must be a valid ISO date string' })
    .transform((val) => new Date(val)),
  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .optional()
    .nullable(),
  vehicleId: z
    .string({ required_error: 'Vehicle is required' })
    .min(1, 'Vehicle is required'),
  driverId: z
    .string({ required_error: 'Driver is required' })
    .min(1, 'Driver is required'),
});

const updateTripSchema = z.object({
  source:          z.string().min(2).max(100).trim().optional(),
  destination:     z.string().min(2).max(100).trim().optional(),
  plannedDistance: z.number().positive().optional(),
  cargoWeight:     z.number().positive().optional(),
  plannedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Planned date must be a valid ISO date' })
    .transform((val) => new Date(val))
    .optional(),
  notes:           z.string().max(500).optional().nullable(),
  vehicleId:       z.string().optional(),
  driverId:        z.string().optional(),
  status:          z.enum(TRIP_STATUSES).optional(),
});

module.exports = { createTripSchema, updateTripSchema };
