const { errorResponse } = require('../utils/response.util');

/**
 * Middleware factory for Zod schema validation.
 * Validates req.body against the provided Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return errorResponse(res, 'Validation failed. Please check your input.', errors, 422);
  }

  // Replace body with parsed & transformed data
  req.body = result.data;
  next();
};

module.exports = { validate };
