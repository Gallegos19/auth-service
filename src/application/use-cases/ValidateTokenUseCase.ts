import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { TokenServicePort } from '../ports/output/TokenServicePort';
import { Token } from '../../domain/value-objects/Token';

export interface ValidateTokenCommand {
  accessToken: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  userId?: string;
  email?: string;
  role?: string;
  expiresAt?: Date;
  error?: string;
}

export class ValidateTokenUseCase {
  constructor(
    private readonly sessionRepository: IUserSessionRepository,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(command: ValidateTokenCommand): Promise<ValidateTokenResponse> {
    try {
      // Validar formato y firma del token
      const payload = await this.tokenService.validateToken(command.accessToken);
      if (!payload) {
        return { isValid: false, error: 'Invalid token format or signature' };
      }

      // Buscar sesión activa
      const session = await this.sessionRepository.findByAccessToken(
        new Token(command.accessToken)
      );

      if (!session) {
        return { isValid: false, error: 'Session not found' };
      }

      // Verificar que la sesión esté activa y no expirada
      if (!session.isValid()) {
        return { isValid: false, error: 'Session expired or inactive' };
      }

      return {
        isValid: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        expiresAt: session.getExpiresAt()
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Token validation failed' 
      };
    }
  }
}