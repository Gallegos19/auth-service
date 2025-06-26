import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './infrastructure/config/enviroment';
import { container } from './infrastructure/config/container';
import { createAuthRoutes } from './infrastructure/web/routes/authRoutes';
import { errorHandlerMiddleware } from './infrastructure/web/middleware/errorHandlerMiddleware';
import { AuthController } from './infrastructure/web/controllers/AuthController';
import { TokenController } from './infrastructure/web/controllers/TokenController';
import { ParentalConsentController } from './infrastructure/web/controllers/ParentalConsentController';

async function bootstrap() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.nodeEnv === 'production' ? [config.frontend.url] : true,
    credentials: true
  }));

  // General middleware
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0'
    });
  });

  // Routes
  const authController = container.get<AuthController>('AuthController');
  const tokenController = container.get<TokenController>('TokenController');
  const parentalConsentController = container.get<ParentalConsentController>('ParentalConsentController');

  app.use('/api/auth', createAuthRoutes(authController, tokenController));

  // Error handling
  app.use(errorHandlerMiddleware);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  });

  // Start server
  app.listen(config.port, () => {
    console.log(`🔐 Auth Service running on port ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch(console.error);