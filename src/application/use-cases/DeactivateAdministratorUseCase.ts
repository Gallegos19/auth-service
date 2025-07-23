import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface DeactivateAdministratorCommand {
  administratorId: string;
  reason?: string;
  permanent?: boolean;
}

export interface DeactivateAdministratorResponse {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
  message: string;
}

@injectable()
export class DeactivateAdministratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: DeactivateAdministratorCommand): Promise<DeactivateAdministratorResponse> {
    try {
      console.log('🔄 DeactivateAdministratorUseCase.execute - Iniciando');
      
      const userId = new UserId(command.administratorId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Administrator not found');
      }

      if (user.getRole() !== 'administrator') {
        throw new Error('User is not an administrator');
      }

      if (user.getAccountStatus() === 'deactivated') {
        throw new Error('Administrator is already deactivated');
      }

      // Verificar que no sea el último administrador activo
      const activeAdmins = await this.userRepository.countByRole('administrator', 'active');
      if (activeAdmins <= 1) {
        throw new Error('Cannot deactivate the last active administrator');
      }

      // Desactivar usuario
      // TODO: Implementar método deactivate en User entity
      (user as any).accountStatus = 'deactivated';

      // Guardar cambios
      await this.userRepository.save(user);

      // TODO: Registrar la razón de desactivación en un log o tabla de auditoría
      if (command.reason) {
        console.log(`Administrator ${user.getEmail().value} deactivated. Reason: ${command.reason}`);
      }

      const response: DeactivateAdministratorResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        message: command.permanent 
          ? 'Administrator permanently deactivated' 
          : 'Administrator deactivated successfully'
      };

      console.log('✅ DeactivateAdministratorUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en DeactivateAdministratorUseCase:', error);
      throw error;
    }
  }
}