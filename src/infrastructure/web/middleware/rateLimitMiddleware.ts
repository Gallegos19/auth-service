import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimitMiddleware = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Rate limit por IP + endpoint
      return `${req.ip}:${req.path}`;
    }
  });
};