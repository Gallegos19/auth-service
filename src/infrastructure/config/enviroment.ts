import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.USER_DB_URL || '',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d'
  },

  // Security
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },

  // External Services
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },

  email: {
    serviceUrl: process.env.EMAIL_SERVICE_URL || 'http://notification-service:3000'
  },

  // Frontend URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'https://xumaa.app'
  }
};