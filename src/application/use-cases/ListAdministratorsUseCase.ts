import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface ListAdministratorsCommand {
  page?: number;
  limit?: number;
  status?: 'active' | 'suspended' | 'deactivated';
}

export interface AdministratorSummary {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountStatus: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ListAdministratorsResponse {
  administrators: AdministratorSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class ListAdministratorsUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: ListAdministratorsCommand): Promise<ListAdministratorsResponse> {
    try {
      console.log('🔄 ListAdministratorsUseCase.execute - Iniciando');
      
      const page = command.page || 1;
      const limit = command.limit || 10;
      const offset = (page - 1) * limit;

      // TODO: Implementar métodos específicos en el repositorio para filtrar por rol
      const administrators = await this.userRepository.findByRole('administrator', limit, offset, command.status);
      const total = await this.userRepository.countByRole('administrator', command.status);

      const administratorSummaries: AdministratorSummary[] = administrators.map(user => ({
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        lastLoginAt: undefined // TODO: Implementar
      }));

      const response: ListAdministratorsResponse = {
        administrators: administratorSummaries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      console.log('✅ ListAdministratorsUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en ListAdministratorsUseCase:', error);
      throw error;
    }
  }
}