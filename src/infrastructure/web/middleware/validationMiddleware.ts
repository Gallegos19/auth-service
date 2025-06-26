import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};