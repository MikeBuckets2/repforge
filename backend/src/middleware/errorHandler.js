import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error.code === 'P2002') {
    res.status(409).json({
      message: 'A record with this value already exists',
      details: error.meta?.target || null
    });
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Something went wrong',
    details: error.details || null,
    stack: env.nodeEnv === 'production' ? undefined : error.stack
  });
};
