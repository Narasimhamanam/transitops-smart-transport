const { z } = require('zod');

const createFuelLogSchema = z.object({
  vehicleId: z.string({ required_error: 'Vehicle is required' }).min(1, 'Vehicle is required'),
  tripId: z.string().optional().nullable(),
  fuelDate: z.string({ required_error: 'Fuel date is required' })
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
    .transform((v) => new Date(v)),
  liters: z.number({ required_error: 'Liters is required' }).positive('Liters must be positive'),
  pricePerLiter: z.number({ required_error: 'Price per liter is required' }).positive('Price must be positive'),
  odometerReading: z.number({ required_error: 'Odometer is required' }).min(0, 'Odometer cannot be negative'),
  fuelStation: z.string({ required_error: 'Fuel station is required' }).min(2, 'Fuel station is too short').max(100).trim(),
});

const updateFuelLogSchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional().nullable(),
  fuelDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').transform((v) => new Date(v)).optional(),
  liters: z.number().positive().optional(),
  pricePerLiter: z.number().positive().optional(),
  odometerReading: z.number().min(0).optional(),
  fuelStation: z.string().min(2).max(100).trim().optional(),
});

module.exports = { createFuelLogSchema, updateFuelLogSchema };
