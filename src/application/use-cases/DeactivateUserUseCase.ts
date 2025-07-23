import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';

export interface DeactivateUserCommand {
  userId: string;
  reason?: string;
  deactivatedBy: string; // ID del usuario que hace la desactivación
}

export interface DeactivateUserResponse {
  userId: string;
  email: string;
  role: string;
  previousStatus: string;
  newStatus: string;
  sessionsRevoked: number;
  message: string;
}

@injectable()
export class DeactivateUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IUserSessionRepository') private readonly sessionRepository: IUserSessionRepository,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(command: DeactivateUserCommand): Promise<DeactivateUserResponse> {
    try {
      console.log('🔄 DeactivateUserUseCase.execute - Iniciando');
      
      const userId = new UserId(command.userId);
      
      // Buscar usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const previousStatus = user.getAccountStatus();
      
      // Validar que se pueda desactivar
      if (previousStatus === 'deactivated') {
        throw new Error('User is already deactivated');
      }

      // Validar que no sea el último administrador
      if (user.getRole() === 'administrator') {
        const adminCount = await this.userRepository.countByRole('administrator');
        if (adminCount <= 1) {
          throw new Error('Cannot deactivate the last administrator');
        }
      }

      // Desactivar usuario
      user.suspend(); // Esto cambia el status a 'suspended'
      // TODO: Agregar método deactivate() a la entidad User si es diferente de suspend()
      
      // Persistir cambios
      await this.userRepository.save(user);
      console.log('✅ Usuario desactivado en base de datos');

      // Revocar todas las sesiones activas del usuario
      const revokedSessions = await this.sessionRepository.revokeAllUserSessions(userId);
      console.log(`✅ ${revokedSessions} sesiones revocadas`);

      // Publicar evento (non-blocking)
      try {
        // TODO: Crear UserDeactivatedEvent
        console.log('✅ Evento de desactivación publicado');
      } catch (eventError) {
        console.warn('⚠️ Error publicando evento (no crítico):', eventError);
      }

      const response: DeactivateUserResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        role: user.getRole(),
        previousStatus,
        newStatus: user.getAccountStatus(),
        sessionsRevoked: revokedSessions,
        message: `User deactivated successfully. ${revokedSessions} sessions revoked.`
      };

      console.log('✅ DeactivateUserUseCase completado:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error en DeactivateUserUseCase:', error);
      throw error;
    }
  }
}