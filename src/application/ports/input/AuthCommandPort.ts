import { RegisterUserCommand, RegisterUserResponse } from '../../use-cases/RegisterUserUseCase';
import { LoginUserCommand, LoginUserResponse } from '../../use-cases/LoginUserUseCase';
import { LogoutUserCommand } from '../../use-cases/LogoutUserUseCase';
import { RefreshTokenCommand, RefreshTokenResponse } from '../../use-cases/RefreshTokenUseCase';
import { CreateModeratorCommand, CreateModeratorResponse } from '../../use-cases/CreateModeratorUseCase';
import { CreateAdministratorCommand, CreateAdministratorResponse } from '../../use-cases/CreateAdministratorUseCase';
import { UpdateModeratorCommand, UpdateModeratorResponse } from '../../use-cases/UpdateModeratorUseCase';
import { UpdateAdministratorCommand, UpdateAdministratorResponse } from '../../use-cases/UpdateAdministratorUseCase';
import { DeactivateModeratorCommand, DeactivateModeratorResponse } from '../../use-cases/DeactivateModeratorUseCase';
import { DeactivateAdministratorCommand, DeactivateAdministratorResponse } from '../../use-cases/DeactivateAdministratorUseCase';

export interface AuthCommandPort {
  registerUser(command: RegisterUserCommand): Promise<RegisterUserResponse>;
  createModerator(command: CreateModeratorCommand): Promise<CreateModeratorResponse>;
  createAdministrator(command: CreateAdministratorCommand): Promise<CreateAdministratorResponse>;
  updateModerator(command: UpdateModeratorCommand): Promise<UpdateModeratorResponse>;
  updateAdministrator(command: UpdateAdministratorCommand): Promise<UpdateAdministratorResponse>;
  deactivateModerator(command: DeactivateModeratorCommand): Promise<DeactivateModeratorResponse>;
  deactivateAdministrator(command: DeactivateAdministratorCommand): Promise<DeactivateAdministratorResponse>;
  loginUser(command: LoginUserCommand): Promise<LoginUserResponse>;
  logoutUser(command: LogoutUserCommand): Promise<void>;
  refreshToken(command: RefreshTokenCommand): Promise<RefreshTokenResponse>;
  requestParentalConsent(command: any): Promise<void>;
  approveParentalConsent(command: any): Promise<void>;
  resetPassword(command: any): Promise<void>;
}