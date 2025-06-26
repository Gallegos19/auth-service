import { Response, Request, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class AuthError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean = true;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle specific error types
  if (err instanceof AuthError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  } else if (err.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Log error for monitoring
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`, {
    statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};