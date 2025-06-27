import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TokenController } from '../controllers/TokenController';
import { ParentalConsentController } from '../controllers/ParentalConsentController';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { z } from 'zod';

// Schemas de validación
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
  age: z.number().int().min(8).max(120),
  firstName: z.string().optional(),
  lastName: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const ParentalConsentSchema = z.object({
  minorUserId: z.string().uuid(),
  parentEmail: z.string().email(),
  parentName: z.string().min(2),
  relationship: z.enum(['father', 'mother', 'guardian'])
});

export function createAuthRoutes(
  authController: AuthController,
  tokenController: TokenController,
  parentalConsentController: ParentalConsentController
): Router {
  const router = Router();

  // ======================
  // AUTHENTICATION ROUTES
  // ======================

  /**
   * @swagger
   * tags:
   *   - name: Autenticación
   *     description: Endpoints para registro, login y logout de usuarios
   *   - name: Tokens
   *     description: Gestión y validación de tokens JWT
   *   - name: Consentimiento Parental
   *     description: Gestión de consentimiento parental para usuarios menores de 13 años
   */

  router.post('/register', 
    rateLimitMiddleware(5, 15), // 5 intentos por 15 minutos
    validationMiddleware(RegisterSchema),
    authController.register.bind(authController)
  );

  router.post('/login',
    rateLimitMiddleware(10, 15), // 10 intentos por 15 minutos
    validationMiddleware(LoginSchema),
    authController.login.bind(authController)
  );

  router.post('/logout',
    authMiddleware, // Requiere token válido
    authController.logout.bind(authController)
  );

  // =================
  // TOKEN ROUTES
  // =================

  // CRÍTICO: Endpoint para API Gateway - alta frecuencia
  router.post('/validate-token',
    rateLimitMiddleware(1000, 1), // 1000 requests por minuto
    tokenController.validateToken.bind(tokenController)
  );

  router.post('/refresh-token',
    rateLimitMiddleware(20, 15), // 20 refresh por 15 minutos
    tokenController.refreshToken.bind(tokenController)
  );

  router.post('/revoke-token',
    authMiddleware,
    tokenController.revokeToken.bind(tokenController)
  );

  // =============================
  // PARENTAL CONSENT ROUTES
  // =============================

  router.post('/parental-consent/request',
    rateLimitMiddleware(3, 60), // 3 solicitudes por hora
    validationMiddleware(ParentalConsentSchema),
    parentalConsentController.requestConsent.bind(parentalConsentController)
  );

  router.post('/parental-consent/approve/:token',
    rateLimitMiddleware(5, 60), // 5 aprobaciones por hora
    parentalConsentController.approveConsent.bind(parentalConsentController)
  );

  router.get('/parental-consent/status/:userId',
    rateLimitMiddleware(10, 15), // 10 consultas por 15 minutos
    parentalConsentController.getConsentStatus.bind(parentalConsentController)
  );

  // ==================
  // PASSWORD RESET (futuro)
  // ==================

  // router.post('/forgot-password', ...);
  // router.post('/reset-password/:token', ...);

  // ==================
  // OAUTH ROUTES (futuro)
  // ==================

  // router.get('/oauth/google', ...);
  // router.get('/oauth/google/callback', ...);

  return router;
}