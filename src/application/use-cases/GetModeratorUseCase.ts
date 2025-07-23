import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface GetModeratorCommand {
  moderatorId: string;
}

export interface GetModeratorResponse {
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
export class GetModeratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: GetModeratorCommand): Promise<GetModeratorResponse> {
    try {
      console.log('🔄 GetModeratorUseCase.execute - Iniciando');
      
      const userId = new UserId(command.moderatorId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Moderator not found');
      }

      if (user.getRole() !== 'moderator') {
        throw new Error('User is not a moderator');
      }

      const response: GetModeratorResponse = {
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

      console.log('✅ GetModeratorUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en GetModeratorUseCase:', error);
      throw error;
    }
  }
}