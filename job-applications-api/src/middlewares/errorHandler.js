import { AppError } from '../errors/AppError.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isKnownError = error instanceof AppError;
  const statusCode = isKnownError ? error.statusCode : 500;
  const code = isKnownError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = isKnownError
    ? error.message
    : 'An unexpected internal server error occurred.';

  if (!isKnownError) {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}
