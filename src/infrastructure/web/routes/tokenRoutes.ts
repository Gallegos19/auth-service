import { Router } from 'express';
import { TokenController } from '../controllers/TokenController';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

export function createTokenRoutes(tokenController: TokenController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/tokens/validate:
   *   post:
   *     summary: Validar token de acceso
   *     description: Endpoint crítico para validación de tokens por API Gateway
   *     tags: [Tokens]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ValidateTokenRequest'
   *     responses:
   *       200:
   *         description: Token válido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidateTokenResponse'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/validate',
    rateLimitMiddleware(1000, 1), // Alto throughput para API Gateway
    tokenController.validateToken.bind(tokenController)
  );

  /**
   * @swagger
   * /api/tokens/refresh:
   *   post:
   *     summary: Renovar tokens
   *     description: Genera nuevo access token usando refresh token
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
   *                 description: Refresh token válido
   *     responses:
   *       200:
   *         description: Tokens renovados exitosamente
   *       401:
   *         description: Refresh token inválido
   */
  router.post('/refresh',
    rateLimitMiddleware(20, 15),
    tokenController.refreshToken.bind(tokenController)
  );

  /**
   * @swagger
   * /api/tokens/revoke:
   *   post:
   *     summary: Revocar token
   *     description: Invalida el token actual del usuario
   *     tags: [Tokens]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token revocado exitosamente
   *       401:
   *         description: No autorizado
   */
  router.post('/revoke',
    authMiddleware,
    tokenController.revokeToken.bind(tokenController)
  );

  return router;
}