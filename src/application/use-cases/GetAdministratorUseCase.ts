import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface GetAdministratorCommand {
  administratorId: string;
}

export interface GetAdministratorResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountStatus: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  loginCount: number;
}

@injectable()
export class GetAdministratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: GetAdministratorCommand): Promise<GetAdministratorResponse> {
    try {
      console.log('🔄 GetAdministratorUseCase.execute - Iniciando');
      
      const userId = new UserId(command.administratorId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Administrator not found');
      }

      if (user.getRole() !== 'administrator') {
        throw new Error('User is not an administrator');
      }

      const response: GetAdministratorResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        lastLoginAt: undefined, // TODO: Implementar en User entity
        loginCount: 0 // TODO: Implementar en User entity
      };

      console.log('✅ GetAdministratorUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en GetAdministratorUseCase:', error);
      throw error;
    }
  }
}