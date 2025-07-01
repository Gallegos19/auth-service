import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TokenController } from '../controllers/TokenController';
import { ParentalConsentController } from '../controllers/ParentalConsentController';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { z } from 'zod';
import { EmailVerificationController } from '../controllers/EmailVerificationController';

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
  parentalConsentController: ParentalConsentController, 
  emailVerificationController: EmailVerificationController
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
    async (req, res) => {
      try {
        await authController.register(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /register:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  router.post('/login',
    rateLimitMiddleware(10, 15), // 10 intentos por 15 minutos
    async (req, res) => {
      try {
        await authController.login(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /login:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  router.post('/logout',
    authMiddleware, // Requiere token válido
    async (req, res) => {
      try {
        await authController.logout(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /logout:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

   router.post('/send-verification',
    authMiddleware, // Requiere estar logueado
    rateLimitMiddleware(3, 60), // 3 envíos por hora
    async (req, res) => {
      try {
        await emailVerificationController.sendVerification(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /send-verification:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  router.post('/verify-email/:token',
    rateLimitMiddleware(10, 60), // 10 verificaciones por hora
    async (req, res) => {
      try {
        await emailVerificationController.verifyEmail(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /verify-email:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

   router.post('/resend-verification',
    rateLimitMiddleware(3, 60), // 3 reenvíos por hora
    async (req, res) => {
      try {
        await emailVerificationController.resendVerification(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /resend-verification:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  router.get('/verification-status/:userId',
    authMiddleware,
    rateLimitMiddleware(20, 15), // 20 consultas por 15 minutos
    async (req, res) => {
      try {
        await emailVerificationController.getVerificationStatus(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /verification-status:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );
  // =================
  // TOKEN ROUTES
  // =================

  // CRÍTICO: Endpoint para API Gateway - alta frecuencia
  router.post('/validate-token',
    rateLimitMiddleware(1000, 1), // 1000 requests por minuto
    async (req, res) => {
      try {
        await tokenController.validateToken(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /validate-token:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  router.post('/refresh-token',
    rateLimitMiddleware(20, 15), // 20 refresh por 15 minutos
    async (req, res) => {
      try {
        await tokenController.refreshToken(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /refresh-token:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  router.post('/revoke-token',
    authMiddleware,
    async (req, res) => {
      try {
        await tokenController.revokeToken(req, res);
      } catch (error) {
        console.error('❌ Error en ruta /revoke-token:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
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