import jwt from 'jsonwebtoken';
import { TokenServicePort } from '../../application/ports/output/TokenServicePort';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly accessTokenSecret: string,
    private readonly refreshTokenSecret: string,
    private readonly accessTokenExpiry: string = '1h',
    private readonly refreshTokenExpiry: string = '30d'
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'xumaa-auth',
      audience: 'xumaa-api'
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(
      { userId: payload.userId }, // Refresh token solo necesita userId
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'xumaa-auth',
        audience: 'xumaa-api'
      }
    );
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'xumaa-auth',
        audience: 'xumaa-api'
      }) as any;

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      return null;
    }
  }

  async validateRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'xumaa-auth',
        audience: 'xumaa-api'
      }) as any;

      return { userId: decoded.userId } as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    // Implementar blacklist si es necesario
    // Por ahora, la revocación se maneja invalidando la sesión en BD
  }
}