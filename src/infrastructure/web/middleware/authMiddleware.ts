import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/container';
import { AuthQueryPort } from '../../../application/ports/input/AuthQueryPort';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
      return;
    }

    const authQueryPort = container.get<AuthQueryPort>('AuthQueryPort');
    const result = await authQueryPort.validateToken({ accessToken: token });

    if (!result.isValid) {
      res.status(401).json({
        success: false,
        error: result.error || 'Invalid token'
      });
      return;
    }

    req.user = {
      userId: result.userId!,
      email: result.email!,
      role: result.role!
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
};