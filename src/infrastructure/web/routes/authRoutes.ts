import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TokenController } from '../controllers/TokenController';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { RegisterUserDto, LoginUserDto } from '../dto';

export function createAuthRoutes(
  authController: AuthController,
  tokenController: TokenController
): Router {
  const router = Router();

  // Auth endpoints
  router.post('/register', 
    rateLimitMiddleware(5, 15), // 5 intentos por 15 minutos
    validationMiddleware(RegisterUserDto),
    authController.register.bind(authController)
  );

  router.post('/login',
    rateLimitMiddleware(10, 15), // 10 intentos por 15 minutos
    validationMiddleware(LoginUserDto),
    authController.login.bind(authController)
  );

  router.post('/logout',
    authController.logout.bind(authController)
  );

  // Token endpoints (CRÍTICOS PARA API GATEWAY)
  router.post('/validate-token',
    rateLimitMiddleware(1000, 1), // 1000 requests por minuto (alta frecuencia)
    tokenController.validateToken.bind(tokenController)
  );

  router.post('/refresh-token',
    rateLimitMiddleware(20, 15), // 20 refresh por 15 minutos
    tokenController.refreshToken.bind(tokenController)
  );

  // Parental consent endpoints
  router.post('/parental-consent/request',
    rateLimitMiddleware(3, 60), // 3 solicitudes por hora
    // parentalConsentController.requestConsent
  );

  router.post('/parental-consent/approve/:token',
    // parentalConsentController.approveConsent
  );

  return router;
}