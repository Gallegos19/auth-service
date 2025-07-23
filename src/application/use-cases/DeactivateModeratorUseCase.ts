import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface DeactivateModeratorCommand {
  moderatorId: string;
  reason?: string;
  permanent?: boolean;
}

export interface DeactivateModeratorResponse {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
  message: string;
}

@injectable()
export class DeactivateModeratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: DeactivateModeratorCommand): Promise<DeactivateModeratorResponse> {
    try {
      console.log('🔄 DeactivateModeratorUseCase.execute - Iniciando');
      
      const userId = new UserId(command.moderatorId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Moderator not found');
      }

      if (user.getRole() !== 'moderator') {
        throw new Error('User is not a moderator');
      }

      if (user.getAccountStatus() === 'deactivated') {
        throw new Error('Moderator is already deactivated');
      }

      // Desactivar usuario
      // TODO: Implementar método deactivate en User entity
      (user as any).accountStatus = 'deactivated';

      // Guardar cambios
      await this.userRepository.save(user);

      // TODO: Registrar la razón de desactivación en un log o tabla de auditoría
      if (command.reason) {
        console.log(`Moderator ${user.getEmail().value} deactivated. Reason: ${command.reason}`);
      }

      const response: DeactivateModeratorResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        message: command.permanent 
          ? 'Moderator permanently deactivated' 
          : 'Moderator deactivated successfully'
      };

      console.log('✅ DeactivateModeratorUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en DeactivateModeratorUseCase:', error);
      throw error;
    }
  }
}