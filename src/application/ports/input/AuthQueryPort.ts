import { ValidateTokenCommand, ValidateTokenResponse } from '../../use-cases/ValidateTokenUseCase';
import { GetModeratorCommand, GetModeratorResponse } from '../../use-cases/GetModeratorUseCase';
import { GetAdministratorCommand, GetAdministratorResponse } from '../../use-cases/GetAdministratorUseCase';
import { ListModeratorsCommand, ListModeratorsResponse } from '../../use-cases/ListModeratorsUseCase';
import { ListAdministratorsCommand, ListAdministratorsResponse } from '../../use-cases/ListAdministratorsUseCase';

export interface AuthQueryPort {
  validateToken(command: ValidateTokenCommand): Promise<ValidateTokenResponse>;
  getUserProfile(userId: string): Promise<any>;
  getActiveUserSessions(userId: string): Promise<any[]>;
  getModerator(command: GetModeratorCommand): Promise<GetModeratorResponse>;
  getAdministrator(command: GetAdministratorCommand): Promise<GetAdministratorResponse>;
  listModerators(command: ListModeratorsCommand): Promise<ListModeratorsResponse>;
  listAdministrators(command: ListAdministratorsCommand): Promise<ListAdministratorsResponse>;
}