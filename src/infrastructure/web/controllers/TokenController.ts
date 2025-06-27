import { Request, Response } from 'express';
import { AuthQueryPort } from '../../../application/ports/input/AuthQueryPort';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';

export class TokenController {
  constructor(
    private readonly authQueryPort: AuthQueryPort,
    private readonly authCommandPort: AuthCommandPort
  ) {}

  /**
   * @swagger
   * /api/auth/validate-token:
   *   post:
   *     summary: Validar token de acceso (API Gateway)
   *     description: |
   *       **ENDPOINT CRÍTICO**: Utilizado por el API Gateway para validar tokens en cada request.
   *       Debe ser extremadamente rápido y confiable.
   *     tags: [Tokens]
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ValidateTokenRequest'
   *           example:
   *             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         schema:
   *           type: string
   *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *         description: Token en header Authorization (alternativo al body)
   *       - in: query
   *         name: token
   *         schema:
   *           type: string
   *         description: Token como query parameter (para casos especiales)
   *     responses:
   *       200:
   *         description: Token válido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidateTokenResponse'
   *             example:
   *               success: true
   *               isValid: true
   *               user:
   *                 userId: "123e4567-e89b-12d3-a456-426614174000"
   *                 email: "usuario@ejemplo.com"
   *                 role: "user"
   *               expiresAt: "2024-12-31T23:59:59.000Z"
   *       400:
   *         description: Token no proporcionado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 isValid:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Token is required"
   *       401:
   *         description: Token inválido o expirado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 isValid:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   examples: ["Invalid token format or signature", "Session expired or inactive", "Session not found"]
   *       500:
   *         description: Error interno del servidor
   */
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

  /**
   * @swagger
   * /api/auth/refresh-token:
   *   post:
   *     summary: Renovar tokens de acceso
   *     description: Genera un nuevo access token usando el refresh token
   *     tags: [Tokens]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Refresh token válido obtenido en el login
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Tokens renovados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                       description: Nuevo access token
   *                     refreshToken:
   *                       type: string
   *                       description: Nuevo refresh token
   *                     expiresIn:
   *                       type: integer
   *                       description: Duración del access token en segundos
   *                       example: 3600
   *                 message:
   *                   type: string
   *                   example: "Token refreshed successfully"
   *       400:
   *         description: Refresh token no proporcionado
   *       401:
   *         description: Refresh token inválido o expirado
   */
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

      const result = await this.authCommandPort.refreshToken({ refreshToken });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Refresh token validation failed'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/revoke-token:
   *   post:
   *     summary: Revocar token actual
   *     description: Invalida el token de acceso actual (equivalente a logout)
   *     tags: [Tokens]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token revocado exitosamente
   *       401:
   *         description: Token inválido o no proporcionado
   */
  async revokeToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Authorization token required'
        });
        return;
      }

      await this.authCommandPort.logoutUser({ accessToken: token });

      res.status(200).json({
        success: true,
        message: 'Token revoked successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token revocation failed'
      });
    }
  }
}