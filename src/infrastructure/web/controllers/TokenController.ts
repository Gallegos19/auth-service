import { Request, Response } from 'express';
import { AuthQueryPort } from '../../../application/ports/input/AuthQueryPort';

export class TokenController {
  constructor(private readonly authQueryPort: AuthQueryPort) {}

  // ENDPOINT CRÍTICO: Validación de tokens para API Gateway
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   req.body.token || 
                   req.query.token as string;

      if (!token) {
        res.status(400).json({
          success: false,
          isValid: false,
          error: 'Token is required'
        });
        return;
      }

      const result = await this.authQueryPort.validateToken({ accessToken: token });

      // Respuesta optimizada para API Gateway
      if (result.isValid) {
        res.status(200).json({
          success: true,
          isValid: true,
          user: {
            userId: result.userId,
            email: result.email,
            role: result.role
          },
          expiresAt: result.expiresAt
        });
      } else {
        res.status(401).json({
          success: false,
          isValid: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        isValid: false,
        error: 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      const result = await this.authQueryPort.refreshToken({ refreshToken });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
}