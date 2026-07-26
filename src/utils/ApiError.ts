export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(statusCode: number, message: string, isOperational = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, true, details);
  }

  static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(401, message, true);
  }

  static forbidden(message = 'Forbidden access'): ApiError {
    return new ApiError(403, message, true);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, true);
  }

  static unprocessable(message: string, details?: any): ApiError {
    return new ApiError(422, message, true, details);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}

export type AsyncRequestHandler = (
  req: any,
  res: any,
  next: any
) => Promise<any>;

export const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
