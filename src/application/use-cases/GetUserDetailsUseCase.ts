import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface GetUserDetailsCommand {
  userId: string;
}

export interface UserDetails {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age: number;
  role: string;
  accountStatus: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  loginCount: number;
  activeSessions: number;
  emailVerifiedAt?: Date;
}

@injectable()
export class GetUserDetailsUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IUserSessionRepository') private readonly sessionRepository: IUserSessionRepository
  ) {}

  async execute(command: GetUserDetailsCommand): Promise<UserDetails> {
    try {
      console.log('🔄 GetUserDetailsUseCase.execute - Iniciando');
      
      const userId = new UserId(command.userId);
      
      // Buscar usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Obtener información adicional
      const activeSessions = await this.sessionRepository.countActiveSessionsByUser(userId);
      
      // TODO: Obtener información de login desde la base de datos
      // Por ahora usamos valores por defecto
      const lastLoginAt = undefined;
      const loginCount = 0;
      const emailVerifiedAt = user.getIsVerified() ? user.getCreatedAt() : undefined;

      const userDetails: UserDetails = {
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        age: user.getAge().value,
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        lastLoginAt,
        loginCount,
        activeSessions,
        emailVerifiedAt
      };

      console.log('✅ GetUserDetailsUseCase completado');
      return userDetails;
      
    } catch (error) {
      console.error('❌ Error en GetUserDetailsUseCase:', error);
      throw error;
    }
  }
}