import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { Token } from '../../domain/value-objects/Token';
import { TokenServicePort } from '../ports/ouput/TokenServicePort';

export interface TokenValidationResult {
  isValid: boolean;
  userId?: string;
  email?: string;
  role?: string;
  sessionId?: string;
  expiresAt?: Date;
  error?: string;
}

export class TokenValidationService {
  constructor(
    private readonly tokenService: TokenServicePort,
    private readonly sessionRepository: IUserSessionRepository
  ) {}

  async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      // 1. Validar formato y firma del token
      const payload = await this.tokenService.validateToken(token);
      if (!payload) {
        return { isValid: false, error: 'Invalid token format or signature' };
      }

      // 2. Buscar sesión activa
      const session = await this.sessionRepository.findByAccessToken(new Token(token));
      if (!session) {
        return { isValid: false, error: 'Session not found' };
      }

      // 3. Verificar que la sesión esté activa
      if (!session.isValid()) {
        return { isValid: false, error: 'Session expired or inactive' };
      }

      return {
        isValid: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: session.getId(),
        expiresAt: session.getExpiresAt()
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Token validation failed' 
      };
    }
  }

  async validateRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const payload = await this.tokenService.validateRefreshToken(token);
      if (!payload) {
        return { isValid: false, error: 'Invalid refresh token' };
      }

      const session = await this.sessionRepository.findByRefreshToken(new Token(token));
      if (!session || !session.isValid()) {
        return { isValid: false, error: 'Refresh session invalid' };
      }

      return {
        isValid: true,
        userId: payload.userId,
        sessionId: session.getId()
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Refresh token validation failed' 
      };
    }
  }
}
