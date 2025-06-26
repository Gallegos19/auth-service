import { ValidateTokenCommand, ValidateTokenResponse } from '../../use-cases/ValidateTokenUseCase';

export interface AuthQueryPort {
  validateToken(command: ValidateTokenCommand): Promise<ValidateTokenResponse>;
  getUserProfile(userId: string): Promise<any>;
  getActiveUserSessions(userId: string): Promise<any[]>;
}