// src/application/use-cases/LogoutUserUseCase.ts
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { Token } from '../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

export interface LogoutUserCommand {
  accessToken: string;
  logoutFromAllDevices?: boolean;
}

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject('IUserSessionRepository') private readonly sessionRepository: IUserSessionRepository
  ) {}

  async execute(command: LogoutUserCommand): Promise<void> {
    const token = new Token(command.accessToken);
    
    // Buscar sesión por access token
    const session = await this.sessionRepository.findByAccessToken(token);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (command.logoutFromAllDevices) {
      // Invalidar todas las sesiones del usuario
      await this.sessionRepository.invalidateUserSessions(session.getUserId());
    } else {
      // Solo invalidar esta sesión
      session.invalidate();
      await this.sessionRepository.save(session);
    }
  }
}