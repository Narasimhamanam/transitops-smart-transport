const { z } = require('zod');

const MAINTENANCE_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const createMaintenanceSchema = z.object({
  vehicleId: z.string({ required_error: 'Vehicle ID is required' }).min(1, 'Vehicle is required'),
  maintenanceType: z.string({ required_error: 'Type is required' }).min(2, 'Type is too short').max(100).trim(),
  description: z.string({ required_error: 'Description is required' }).min(5, 'Description is too short').max(500).trim(),
  serviceCenter: z.string({ required_error: 'Service center is required' }).min(2, 'Service center name is too short').max(100).trim(),
  estimatedCost: z.number({ required_error: 'Estimated cost is required' }).positive('Cost must be positive'),
  scheduledDate: z.string({ required_error: 'Scheduled date is required' })
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
    .transform((v) => new Date(v)),
});

const updateMaintenanceSchema = z.object({
  vehicleId: z.string().optional(),
  maintenanceType: z.string().min(2).max(100).trim().optional(),
  description: z.string().min(5).max(500).trim().optional(),
  serviceCenter: z.string().min(2).max(100).trim().optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional().nullable(),
  scheduledDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').transform((v) => new Date(v)).optional(),
  completedDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').transform((v) => new Date(v)).optional().nullable(),
  status: z.enum(MAINTENANCE_STATUSES).optional(),
});

module.exports = { createMaintenanceSchema, updateMaintenanceSchema };
