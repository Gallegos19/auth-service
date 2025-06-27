import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/enviroment';
import { injectable } from 'inversify';
import { TokenPayload, TokenServicePort } from '../../application/ports/ouput/TokenServicePort';

@injectable()
export class JwtTokenService implements TokenServicePort {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = config.jwt.accessSecret;
    this.refreshTokenSecret = config.jwt.refreshSecret;
    this.accessTokenExpiry = config.jwt.accessExpiry as string;
    this.refreshTokenExpiry = config.jwt.refreshExpiry as string;

    // Validar configuración al inicializar
    this.validateConfiguration();
  }

async generateAccessToken(payload: TokenPayload): Promise<string> {
  const options: SignOptions = {
    expiresIn: this.accessTokenExpiry as jwt.SignOptions["expiresIn"], // "15m", "1h", etc.
    issuer: 'xumaa-auth',
    audience: 'xumaa-api',
    subject: String(payload.userId)
  };

  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  };

  return jwt.sign(tokenPayload, this.accessTokenSecret, options);
}


  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiry as jwt.SignOptions["expiresIn"],
      issuer: 'xumaa-auth',
      audience: 'xumaa-api',
      subject: String(payload.userId)
    };

    return jwt.sign({ userId: payload.userId }, this.refreshTokenSecret, options);
  }


  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'xumaa-auth',
        audience: 'xumaa-api'
      }) as any;

      return {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Token expired:', error.expiredAt);
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token:', error.message);
      }
      return null;
    }
  }

  async validateRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'xumaa-auth',
        audience: 'xumaa-api'
      }) as any;

      return { 
        userId: decoded.userId || decoded.sub,
        email: '', // Refresh token no incluye email
        role: ''   // Refresh token no incluye role
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log('Refresh token validation failed:', error.message);
      } else {
        console.log('Refresh token validation failed:', error);
      }
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    // Implementar blacklist si es necesario
    // Por ahora, la revocación se maneja invalidando la sesión en BD
    console.log('Token revocation requested for token ending in:', token.slice(-10));
  }

  private validateConfiguration(): void {
    if (!this.accessTokenSecret || this.accessTokenSecret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    
    if (!this.refreshTokenSecret || this.refreshTokenSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
    }

    if (this.accessTokenSecret === this.refreshTokenSecret) {
      throw new Error('Access and refresh token secrets must be different');
    }
  }
}