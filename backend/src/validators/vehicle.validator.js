const { z } = require('zod');

const VEHICLE_TYPES   = ['CAR', 'VAN', 'MINIBUS', 'BUS', 'TRUCK', 'TRAILER', 'MOTORCYCLE'];
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const createVehicleSchema = z.object({
  registrationNumber: z
    .string({ required_error: 'Registration number is required' })
    .min(3, 'Registration number must be at least 3 characters')
    .max(20, 'Registration number must be under 20 characters')
    .trim()
    .toUpperCase(),
  vehicleName: z
    .string({ required_error: 'Vehicle name is required' })
    .min(2, 'Vehicle name must be at least 2 characters')
    .max(100, 'Vehicle name must be under 100 characters')
    .trim(),
  vehicleType: z.enum(VEHICLE_TYPES, {
    required_error: 'Vehicle type is required',
    invalid_type_error: `Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}`,
  }),
  maxLoadCapacity: z
    .number({ required_error: 'Max load capacity is required', invalid_type_error: 'Max load capacity must be a number' })
    .positive('Max load capacity must be positive'),
  odometer: z
    .number({ invalid_type_error: 'Odometer must be a number' })
    .min(0, 'Odometer cannot be negative')
    .optional()
    .default(0),
  acquisitionCost: z
    .number({ required_error: 'Acquisition cost is required', invalid_type_error: 'Acquisition cost must be a number' })
    .min(0, 'Acquisition cost cannot be negative'),
  status: z.enum(VEHICLE_STATUSES).optional().default('AVAILABLE'),
});

const updateVehicleSchema = z.object({
  registrationNumber: z.string().min(3).max(20).trim().toUpperCase().optional(),
  vehicleName:        z.string().min(2).max(100).trim().optional(),
  vehicleType:        z.enum(VEHICLE_TYPES).optional(),
  maxLoadCapacity:    z.number().positive().optional(),
  odometer:           z.number().min(0).optional(),
  acquisitionCost:    z.number().min(0).optional(),
  status:             z.enum(VEHICLE_STATUSES).optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
