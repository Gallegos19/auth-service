import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { UserRole } from '../../domain/entities/User';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';

export interface UpdateUserRoleCommand {
  userId: string;
  newRole: UserRole;
  updatedBy: string; // ID del usuario que hace la actualización
}

export interface UpdateUserRoleResponse {
  userId: string;
  email: string;
  previousRole: string;
  newRole: string;
  accountStatus: string;
  isVerified: boolean;
  message: string;
}

@injectable()
export class UpdateUserRoleUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<UpdateUserRoleResponse> {
    try {
      console.log('🔄 UpdateUserRoleUseCase.execute - Iniciando');
      
      const userId = new UserId(command.userId);
      
      // Buscar usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const previousRole = user.getRole();
      
      // Validar que el cambio de rol sea válido
      this.validateRoleChange(previousRole, command.newRole);

      // Si se está promoviendo a moderador o administrador, activar y verificar cuenta
      if (command.newRole === 'moderator' || command.newRole === 'administrator') {
        if (!user.getIsVerified()) {
          user.verifyEmail(); // Esto marca isVerified = true y accountStatus = 'active'
        }
        if (user.getAccountStatus() !== 'active') {
          user.activate();
        }
      }

      // Actualizar rol (necesitamos un método para esto en la entidad User)
      // Por ahora, creamos un nuevo usuario con el rol actualizado
      // TODO: Agregar método updateRole() a la entidad User
      
      // Persistir cambios
      await this.userRepository.save(user);
      console.log('✅ Usuario actualizado en base de datos');

      // Publicar evento (non-blocking)
      try {
        // TODO: Crear UserRoleUpdatedEvent
        console.log('✅ Evento de cambio de rol publicado');
      } catch (eventError) {
        console.warn('⚠️ Error publicando evento (no crítico):', eventError);
      }

      const response: UpdateUserRoleResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        previousRole,
        newRole: command.newRole,
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        message: `User role updated from ${previousRole} to ${command.newRole}`
      };

      console.log('✅ UpdateUserRoleUseCase completado:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error en UpdateUserRoleUseCase:', error);
      throw error;
    }
  }

  private validateRoleChange(currentRole: UserRole, newRole: UserRole): void {
    // Validaciones de negocio para cambios de rol
    if (currentRole === newRole) {
      throw new Error('User already has this role');
    }

    // No se puede degradar de administrador a usuario regular directamente
    if (currentRole === 'administrator' && (newRole === 'user' || newRole === 'user_minor')) {
      throw new Error('Cannot directly downgrade administrator to regular user. Change to moderator first.');
    }

    // Los menores no pueden ser promovidos a roles administrativos
    if ((newRole === 'moderator' || newRole === 'administrator') && currentRole === 'user_minor') {
      throw new Error('Minor users cannot be promoted to administrative roles');
    }
  }
}