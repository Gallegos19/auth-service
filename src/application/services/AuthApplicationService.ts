import { AuthCommandPort } from '../ports/input/AuthCommandPort';
import { AuthQueryPort } from '../ports/input/AuthQueryPort';
import { RegisterUserUseCase, RegisterUserCommand, RegisterUserResponse } from '../use-cases/RegisterUserUseCase';
import { LoginUserUseCase, LoginUserCommand, LoginUserResponse } from '../use-cases/LoginUserUseCase';
import { LogoutUserUseCase, LogoutUserCommand } from '../use-cases/LogoutUserUseCase';
import { ValidateTokenUseCase, ValidateTokenCommand, ValidateTokenResponse } from '../use-cases/ValidateTokenUseCase';
import { RefreshTokenUseCase, RefreshTokenCommand, RefreshTokenResponse } from '../use-cases/RefreshTokenUseCase';
import { RequestParentalConsentUseCase } from '../use-cases/RequestParentalConsentUseCase';
import { ForgotPasswordUseCase } from '../use-cases/ForgotPasswordUseCase';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthApplicationService implements AuthCommandPort, AuthQueryPort {
  constructor(
    @inject('RegisterUserUseCase') private readonly registerUserUseCase: RegisterUserUseCase,
    @inject('LoginUserUseCase') private readonly loginUserUseCase: LoginUserUseCase,
    @inject('LogoutUserUseCase') private readonly logoutUserUseCase: LogoutUserUseCase,
    @inject('ValidateTokenUseCase') private readonly validateTokenUseCase: ValidateTokenUseCase,
    @inject('RefreshTokenUseCase') private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject('RequestParentalConsentUseCase') private readonly requestParentalConsentUseCase: RequestParentalConsentUseCase,
    @inject('ForgotPasswordUseCase') private readonly forgotPasswordUseCase: ForgotPasswordUseCase
  ) {}

  // Command Methods
  async registerUser(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    try {
      console.log('🔄 AuthApplicationService.registerUser - Delegando a use case');
      const result = await this.registerUserUseCase.execute(command);
      console.log('✅ AuthApplicationService.registerUser - Use case completado:', result);
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.registerUser - Error:', error);
      throw error;
    }
  }

  async loginUser(command: LoginUserCommand): Promise<LoginUserResponse> {
    try {
      console.log('🔄 AuthApplicationService.loginUser - Delegando a use case');
      const result = await this.loginUserUseCase.execute(command);
      console.log('✅ AuthApplicationService.loginUser - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.loginUser - Error:', error);
      throw error;
    }
  }

  async logoutUser(command: LogoutUserCommand): Promise<void> {
    try {
      console.log('🔄 AuthApplicationService.logoutUser - Delegando a use case');
      await this.logoutUserUseCase.execute(command);
      console.log('✅ AuthApplicationService.logoutUser - Use case completado');
    } catch (error) {
      console.error('❌ AuthApplicationService.logoutUser - Error:', error);
      throw error;
    }
  }

  async refreshToken(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    try {
      console.log('🔄 AuthApplicationService.refreshToken - Delegando a use case');
      const result = await this.refreshTokenUseCase.execute(command);
      console.log('✅ AuthApplicationService.refreshToken - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.refreshToken - Error:', error);
      throw error;
    }
  }

  async requestParentalConsent(command: any): Promise<void> {
    try {
      console.log('🔄 AuthApplicationService.requestParentalConsent - Delegando a use case');
      await this.requestParentalConsentUseCase.execute(command);
      console.log('✅ AuthApplicationService.requestParentalConsent - Use case completado');
    } catch (error) {
      console.error('❌ AuthApplicationService.requestParentalConsent - Error:', error);
      throw error;
    }
  }

  async approveParentalConsent(command: any): Promise<void> {
    // Implementar ApproveParentalConsentUseCase
    throw new Error('ApproveParentalConsentUseCase not implemented yet');
  }

  async resetPassword(command: any): Promise<void> {
    try {
      console.log('🔄 AuthApplicationService.resetPassword - Delegando a use case');
      await this.forgotPasswordUseCase.execute(command);
      console.log('✅ AuthApplicationService.resetPassword - Use case completado');
    } catch (error) {
      console.error('❌ AuthApplicationService.resetPassword - Error:', error);
      throw error;
    }
  }

  // Query Methods
  async validateToken(command: ValidateTokenCommand): Promise<ValidateTokenResponse> {
    try {
      console.log('🔄 AuthApplicationService.validateToken - Delegando a use case');
      const result = await this.validateTokenUseCase.execute(command);
      console.log('✅ AuthApplicationService.validateToken - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.validateToken - Error:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    // Implementar GetUserProfileUseCase
    throw new Error('GetUserProfileUseCase not implemented yet');
  }

  async getActiveUserSessions(userId: string): Promise<any[]> {
    // Implementar GetActiveUserSessionsUseCase
    throw new Error('GetActiveUserSessionsUseCase not implemented yet');
  }
}