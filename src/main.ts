import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './infrastructure/config/enviroment';
import { container, cleanup } from './infrastructure/config/container';
import { connectDatabase } from './infrastructure/config/database';
import { createAuthRoutes } from './infrastructure/web/routes/authRoutes';
import { errorHandlerMiddleware } from './infrastructure/web/middleware/errorHandlerMiddleware';
import { AuthController } from './infrastructure/web/controllers/AuthController';
import { TokenController } from './infrastructure/web/controllers/TokenController';
import { ParentalConsentController } from './infrastructure/web/controllers/ParentalConsentController';
import { setupSwagger } from './infrastructure/web/swagger/swagger.config';

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Verifica que el servicio de autenticación esté funcionando correctamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: "auth-service"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
async function bootstrap() {
  try {
    console.log('🚀 Starting Xuma\'a Auth Service...');

    // Conectar a la base de datos
    await connectDatabase();

    const app = express();

    // ==================
    // SECURITY MIDDLEWARE
    // ==================
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Para Swagger UI
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    app.use(cors({
      origin: config.nodeEnv === 'production' 
        ? [config.frontend.url] 
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // ==================
    // GENERAL MIDDLEWARE
    // ==================
    app.use(compression());
    app.use(express.json({ 
      limit: '10mb',
      type: ['application/json', 'text/plain']
    }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy for accurate IP addresses
    app.set('trust proxy', true);

    // ==================
    // DOCUMENTATION
    // ==================
    setupSwagger(app);

    // ==================
    // HEALTH CHECK
    // ==================
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'xumaa-auth-service',
        version: '1.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version
      });
    });

    app.get('/health/ready', async (req, res) => {
      try {
        // Verificar conexión a base de datos
        const prisma = container.get('PrismaClient') as import('@prisma/client').PrismaClient;
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
          status: 'READY',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'OK',
            container: 'OK'
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'NOT_READY',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // ==================
    // API ROUTES
    // ==================
    const authController = container.get<AuthController>('AuthController');
    const tokenController = container.get<TokenController>('TokenController');
    const parentalConsentController = container.get<ParentalConsentController>('ParentalConsentController');

    app.use('/api/auth', createAuthRoutes(
      authController, 
      tokenController, 
      parentalConsentController
    ));

    // Redirect para documentación
    app.get('/', (req, res) => {
      res.redirect('/api/docs');
    });

    // ==================
    // ERROR HANDLING
    // ==================
    app.use(errorHandlerMiddleware);

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // ==================
    // START SERVER
    // ==================
    const server = app.listen(config.port, () => {
      console.log(`🔐 Xuma'a Auth Service running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
      console.log(`💚 Health Check: http://localhost:${config.port}/health`);
      console.log('✅ Service ready to accept connections');
    });

    // ==================
    // GRACEFUL SHUTDOWN
    // ==================
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await cleanup();
          console.log('🧹 Cleanup completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during cleanup:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⏰ Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();

