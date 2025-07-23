import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface ListModeratorsCommand {
  page?: number;
  limit?: number;
  status?: 'active' | 'suspended' | 'deactivated';
}

export interface ModeratorSummary {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountStatus: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ListModeratorsResponse {
  moderators: ModeratorSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class ListModeratorsUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: ListModeratorsCommand): Promise<ListModeratorsResponse> {
    try {
      console.log('🔄 ListModeratorsUseCase.execute - Iniciando');
      
      const page = command.page || 1;
      const limit = command.limit || 10;
      const offset = (page - 1) * limit;

      // TODO: Implementar métodos específicos en el repositorio para filtrar por rol
      const moderators = await this.userRepository.findByRole('moderator', limit, offset, command.status);
      const total = await this.userRepository.countByRole('moderator', command.status);

      const moderatorSummaries: ModeratorSummary[] = moderators.map(user => ({
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        lastLoginAt: undefined // TODO: Implementar
      }));

      const response: ListModeratorsResponse = {
        moderators: moderatorSummaries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      console.log('✅ ListModeratorsUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en ListModeratorsUseCase:', error);
      throw error;
    }
  }
}