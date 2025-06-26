import { RegisterUserCommand, RegisterUserResponse } from '../../use-cases/RegisterUserUseCase';
import { LoginUserCommand, LoginUserResponse } from '../../use-cases/LoginUserUseCase';
import { LogoutUserCommand } from '../../use-cases/LogoutUserUseCase';
import { RefreshTokenCommand, RefreshTokenResponse } from '../../use-cases/RefreshTokenUseCase';

export interface AuthCommandPort {
  registerUser(command: RegisterUserCommand): Promise<RegisterUserResponse>;
  loginUser(command: LoginUserCommand): Promise<LoginUserResponse>;
  logoutUser(command: LogoutUserCommand): Promise<void>;
  refreshToken(command: RefreshTokenCommand): Promise<RefreshTokenResponse>;
  requestParentalConsent(command: any): Promise<void>;
  approveParentalConsent(command: any): Promise<void>;
  resetPassword(command: any): Promise<void>;
}