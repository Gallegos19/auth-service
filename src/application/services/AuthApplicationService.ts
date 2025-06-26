import { AuthCommandPort } from '../ports/input/AuthCommandPort';
import { AuthQueryPort } from '../ports/input/AuthQueryPort';
import { RegisterUserUseCase, RegisterUserCommand, RegisterUserResponse } from '../use-cases/RegisterUserUseCase';
import { LoginUserUseCase, LoginUserCommand, LoginUserResponse } from '../use-cases/LoginUserUseCase';
import { LogoutUserUseCase, LogoutUserCommand } from '../use-cases/LogoutUserUseCase';
import { ValidateTokenUseCase, ValidateTokenCommand, ValidateTokenResponse } from '../use-cases/ValidateTokenUseCase';
import { RefreshTokenUseCase, RefreshTokenCommand, RefreshTokenResponse } from '../use-cases/RefreshTokenUseCase';
import { RequestParentalConsentUseCase } from '../use-cases/RequestParentalConsentUseCase';
import { ForgotPasswordUseCase } from '../use-cases/ForgotPasswordUseCase';

export class AuthApplicationService implements AuthCommandPort, AuthQueryPort {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly requestParentalConsentUseCase: RequestParentalConsentUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase
  ) {}

  // Command Methods
  async registerUser(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    return this.registerUserUseCase.execute(command);
  }

  async loginUser(command: LoginUserCommand): Promise<LoginUserResponse> {
    return this.loginUserUseCase.execute(command);
  }

  async logoutUser(command: LogoutUserCommand): Promise<void> {
    return this.logoutUserUseCase.execute(command);
  }

  async refreshToken(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    return this.refreshTokenUseCase.execute(command);
  }

  async requestParentalConsent(command: any): Promise<void> {
    return this.requestParentalConsentUseCase.execute(command);
  }

  async approveParentalConsent(command: any): Promise<void> {
    // Implementar ApproveParentalConsentUseCase
    throw new Error('Not implemented yet');
  }

  async resetPassword(command: any): Promise<void> {
    return this.forgotPasswordUseCase.execute(command);
  }

  // Query Methods
  async validateToken(command: ValidateTokenCommand): Promise<ValidateTokenResponse> {
    return this.validateTokenUseCase.execute(command);
  }

  async getUserProfile(userId: string): Promise<any> {
    // Implementar GetUserProfileUseCase
    throw new Error('Not implemented yet');
  }

  async getActiveUserSessions(userId: string): Promise<any[]> {
    // Implementar GetActiveUserSessionsUseCase
    throw new Error('Not implemented yet');
  }
}