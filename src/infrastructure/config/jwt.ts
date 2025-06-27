import { config } from './enviroment';

export const jwtConfig = {
  access: {
    secret: config.jwt.accessSecret,
    expiresIn: config.jwt.accessExpiry,
    algorithm: 'HS256' as const,
    issuer: 'xumaa-auth-service',
    audience: 'xumaa-api'
  },
  refresh: {
    secret: config.jwt.refreshSecret,
    expiresIn: config.jwt.refreshExpiry,
    algorithm: 'HS256' as const,
    issuer: 'xumaa-auth-service',
    audience: 'xumaa-api'
  }
};

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export const validateJwtConfig = (): void => {
  if (!config.jwt.accessSecret || config.jwt.accessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
  }
  
  if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }
  
  console.log('✅ JWT configuration validated');
};