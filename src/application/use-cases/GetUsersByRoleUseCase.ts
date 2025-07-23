import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRole } from '../../domain/entities/User';

export interface GetUsersByRoleCommand {
  role: UserRole;
  page?: number;
  limit?: number;
}

export interface UserSummary {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountStatus: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface GetUsersByRoleResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class GetUsersByRoleUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: GetUsersByRoleCommand): Promise<GetUsersByRoleResponse> {
    try {
      console.log('🔄 GetUsersByRoleUseCase.execute - Iniciando');
      
      const page = command.page || 1;
      const limit = command.limit || 10;
      const offset = (page - 1) * limit;

      // Obtener usuarios por rol con paginación
      const users = await this.userRepository.findByRole(command.role, limit, offset);
      const total = await this.userRepository.countByRole(command.role);

      const userSummaries: UserSummary[] = users.map((user: any) => ({
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        lastLoginAt: undefined // TODO: Implementar en User entity si es necesario
      }));

      const totalPages = Math.ceil(total / limit);

      const response: GetUsersByRoleResponse = {
        users: userSummaries,
        total,
        page,
        limit,
        totalPages
      };

      console.log('✅ GetUsersByRoleUseCase completado:', { total, page, limit });
      return response;
      
    } catch (error) {
      console.error('❌ Error en GetUsersByRoleUseCase:', error);
      throw error;
    }
  }
}