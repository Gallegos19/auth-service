import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xuma\'a Auth Service API',
      version: '1.0.0',
      description: 'Microservicio de autenticación para la plataforma Xuma\'a - Gestión completa de usuarios, sesiones y consentimiento parental',
      contact: {
        name: 'Universidad Politécnica de Chiapas - Equipo 9-A',
        email: 'support@xumaa.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.xumaa.app/auth',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID único del usuario' },
            email: { type: 'string', format: 'email', description: 'Email del usuario' },
            firstName: { type: 'string', description: 'Nombre del usuario' },
            lastName: { type: 'string', description: 'Apellido del usuario' },
            age: { type: 'integer', minimum: 8, maximum: 120, description: 'Edad del usuario' },
            role: { type: 'string', enum: ['user', 'user_minor'], description: 'Rol del usuario' },
            isVerified: { type: 'boolean', description: 'Si el email está verificado' },
            accountStatus: { 
              type: 'string', 
              enum: ['active', 'suspended', 'pending_verification', 'deactivated'],
              description: 'Estado de la cuenta'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'confirmPassword', 'age'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email único del usuario',
              example: 'juan.perez@email.com'
            },
            password: { 
              type: 'string', 
              minLength: 8,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              description: 'Contraseña (mín. 8 caracteres, mayúscula, minúscula y número)',
              example: 'MiPassword123'
            },
            confirmPassword: { 
              type: 'string',
              description: 'Confirmación de contraseña (debe coincidir)',
              example: 'MiPassword123'
            },
            age: { 
              type: 'integer', 
              minimum: 8, 
              maximum: 120,
              description: 'Edad del usuario (determina permisos y contenido)',
              example: 15
            },
            firstName: { 
              type: 'string',
              description: 'Nombre del usuario (opcional)',
              example: 'Juan'
            },
            lastName: { 
              type: 'string',
              description: 'Apellido del usuario (opcional)',
              example: 'Pérez'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email registrado',
              example: 'juan.perez@email.com'
            },
            password: { 
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'MiPassword123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' },
                accessToken: { type: 'string', description: 'JWT token para autenticación' },
                refreshToken: { type: 'string', description: 'Token para renovar acceso' },
                expiresIn: { type: 'integer', description: 'Duración en segundos del access token', example: 3600 },
                tokenType: { type: 'string', example: 'Bearer' },
                user: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'user_minor'] },
                    isVerified: { type: 'boolean' }
                  }
                }
              }
            },
            message: { type: 'string', example: 'Login successful' }
          }
        },
        ValidateTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { 
              type: 'string',
              description: 'JWT access token a validar',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        ValidateTokenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            isValid: { type: 'boolean', description: 'Si el token es válido' },
            user: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['user', 'user_minor'] }
              },
              description: 'Información del usuario (solo si token es válido)'
            },
            expiresAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Fecha de expiración del token'
            },
            error: { 
              type: 'string',
              description: 'Mensaje de error (solo si token es inválido)'
            }
          }
        },
        ParentalConsentRequest: {
          type: 'object',
          required: ['minorUserId', 'parentEmail', 'parentName', 'relationship'],
          properties: {
            minorUserId: { 
              type: 'string', 
              format: 'uuid',
              description: 'ID del usuario menor de edad'
            },
            parentEmail: { 
              type: 'string', 
              format: 'email',
              description: 'Email del padre/madre/tutor',
              example: 'padre@email.com'
            },
            parentName: { 
              type: 'string',
              description: 'Nombre completo del padre/madre/tutor',
              example: 'José Pérez González'
            },
            relationship: { 
              type: 'string', 
              enum: ['father', 'mother', 'guardian'],
              description: 'Relación con el menor',
              example: 'father'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', description: 'Mensaje de error' },
            details: { 
              type: 'array',
              items: { type: 'object' },
              description: 'Detalles adicionales del error (validación, etc.)'
            }
          }
        }
      }
    }
  },
  apis: ['./src/infrastructure/web/controllers/*.ts', './src/infrastructure/web/routes/*.ts']
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Xuma\'a Auth API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true
    }
  }));

  // JSON endpoint para la documentación
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}