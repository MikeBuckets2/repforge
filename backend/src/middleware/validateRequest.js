import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(
      422,
      'Validation failed',
      errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    );
  }

  next();
};
