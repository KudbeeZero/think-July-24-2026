import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.ts';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred on the server';
  let details = err.details || null;

  // Handle SyntaxError (invalid JSON payload)
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload received';
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log error
  if (!err.isOperational) {
    console.error('[UNHANDLED ERROR]', {
      path: req.path,
      method: req.method,
      error: err,
      stack: err.stack,
    });
  } else {
    console.warn(`[API ERROR ${statusCode}] ${req.method} ${req.path} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 400 ? 'BAD_REQUEST' :
            statusCode === 401 ? 'UNAUTHORIZED' :
            statusCode === 403 ? 'FORBIDDEN' :
            statusCode === 404 ? 'NOT_FOUND' :
            statusCode === 422 ? 'UNPROCESSABLE_ENTITY' :
            'INTERNAL_SERVER_ERROR',
      message,
      ...(details && { details }),
      ...(isDevelopment && err.stack && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
