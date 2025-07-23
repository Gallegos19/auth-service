import { AuthCommandPort } from '../ports/input/AuthCommandPort';
import { AuthQueryPort } from '../ports/input/AuthQueryPort';
import { RegisterUserUseCase, RegisterUserCommand, RegisterUserResponse } from '../use-cases/RegisterUserUseCase';
import { CreateModeratorUseCase, CreateModeratorCommand, CreateModeratorResponse } from '../use-cases/CreateModeratorUseCase';
import { CreateAdministratorUseCase, CreateAdministratorCommand, CreateAdministratorResponse } from '../use-cases/CreateAdministratorUseCase';
import { GetModeratorUseCase, GetModeratorCommand, GetModeratorResponse } from '../use-cases/GetModeratorUseCase';
import { GetAdministratorUseCase, GetAdministratorCommand, GetAdministratorResponse } from '../use-cases/GetAdministratorUseCase';
import { ListModeratorsUseCase, ListModeratorsCommand, ListModeratorsResponse } from '../use-cases/ListModeratorsUseCase';
import { ListAdministratorsUseCase, ListAdministratorsCommand, ListAdministratorsResponse } from '../use-cases/ListAdministratorsUseCase';
import { UpdateModeratorUseCase, UpdateModeratorCommand, UpdateModeratorResponse } from '../use-cases/UpdateModeratorUseCase';
import { UpdateAdministratorUseCase, UpdateAdministratorCommand, UpdateAdministratorResponse } from '../use-cases/UpdateAdministratorUseCase';
import { DeactivateModeratorUseCase, DeactivateModeratorCommand, DeactivateModeratorResponse } from '../use-cases/DeactivateModeratorUseCase';
import { DeactivateAdministratorUseCase, DeactivateAdministratorCommand, DeactivateAdministratorResponse } from '../use-cases/DeactivateAdministratorUseCase';
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
    @inject('ApproveParentalConsentUseCase') private readonly approveParentalConsentUseCase: any, // Implementar ApproveParentalConsentUseCase
    @inject('RegisterUserUseCase') private readonly registerUserUseCase: RegisterUserUseCase,
    @inject('CreateModeratorUseCase') private readonly createModeratorUseCase: CreateModeratorUseCase,
    @inject('CreateAdministratorUseCase') private readonly createAdministratorUseCase: CreateAdministratorUseCase,
    @inject('GetModeratorUseCase') private readonly getModeratorUseCase: GetModeratorUseCase,
    @inject('GetAdministratorUseCase') private readonly getAdministratorUseCase: GetAdministratorUseCase,
    @inject('ListModeratorsUseCase') private readonly listModeratorsUseCase: ListModeratorsUseCase,
    @inject('ListAdministratorsUseCase') private readonly listAdministratorsUseCase: ListAdministratorsUseCase,
    @inject('UpdateModeratorUseCase') private readonly updateModeratorUseCase: UpdateModeratorUseCase,
    @inject('UpdateAdministratorUseCase') private readonly updateAdministratorUseCase: UpdateAdministratorUseCase,
    @inject('DeactivateModeratorUseCase') private readonly deactivateModeratorUseCase: DeactivateModeratorUseCase,
    @inject('DeactivateAdministratorUseCase') private readonly deactivateAdministratorUseCase: DeactivateAdministratorUseCase,
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

  async createModerator(command: CreateModeratorCommand): Promise<CreateModeratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.createModerator - Delegando a use case');
      const result = await this.createModeratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.createModerator - Use case completado:', result);
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.createModerator - Error:', error);
      throw error;
    }
  }

  async createAdministrator(command: CreateAdministratorCommand): Promise<CreateAdministratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.createAdministrator - Delegando a use case');
      const result = await this.createAdministratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.createAdministrator - Use case completado:', result);
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.createAdministrator - Error:', error);
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
    try {
      console.log('🔄 AuthApplicationService.approveParentalConsent - Delegando a use case' );
      await this.approveParentalConsentUseCase.execute(command);
      console.log('✅ AuthApplicationService.approveParentalConsent - Use case completado');
    } catch (error) {
      console.error('❌ AuthApplicationService.approveParentalConsent - Error:', error);
      throw error;
    }
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

  // CRUD Methods for Moderators
  async updateModerator(command: UpdateModeratorCommand): Promise<UpdateModeratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.updateModerator - Delegando a use case');
      const result = await this.updateModeratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.updateModerator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.updateModerator - Error:', error);
      throw error;
    }
  }

  async deactivateModerator(command: DeactivateModeratorCommand): Promise<DeactivateModeratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.deactivateModerator - Delegando a use case');
      const result = await this.deactivateModeratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.deactivateModerator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.deactivateModerator - Error:', error);
      throw error;
    }
  }

  // CRUD Methods for Administrators
  async updateAdministrator(command: UpdateAdministratorCommand): Promise<UpdateAdministratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.updateAdministrator - Delegando a use case');
      const result = await this.updateAdministratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.updateAdministrator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.updateAdministrator - Error:', error);
      throw error;
    }
  }

  async deactivateAdministrator(command: DeactivateAdministratorCommand): Promise<DeactivateAdministratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.deactivateAdministrator - Delegando a use case');
      const result = await this.deactivateAdministratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.deactivateAdministrator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.deactivateAdministrator - Error:', error);
      throw error;
    }
  }

  // Query Methods for CRUD
  async getModerator(command: GetModeratorCommand): Promise<GetModeratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.getModerator - Delegando a use case');
      const result = await this.getModeratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.getModerator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.getModerator - Error:', error);
      throw error;
    }
  }

  async getAdministrator(command: GetAdministratorCommand): Promise<GetAdministratorResponse> {
    try {
      console.log('🔄 AuthApplicationService.getAdministrator - Delegando a use case');
      const result = await this.getAdministratorUseCase.execute(command);
      console.log('✅ AuthApplicationService.getAdministrator - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.getAdministrator - Error:', error);
      throw error;
    }
  }

  async listModerators(command: ListModeratorsCommand): Promise<ListModeratorsResponse> {
    try {
      console.log('🔄 AuthApplicationService.listModerators - Delegando a use case');
      const result = await this.listModeratorsUseCase.execute(command);
      console.log('✅ AuthApplicationService.listModerators - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.listModerators - Error:', error);
      throw error;
    }
  }

  async listAdministrators(command: ListAdministratorsCommand): Promise<ListAdministratorsResponse> {
    try {
      console.log('🔄 AuthApplicationService.listAdministrators - Delegando a use case');
      const result = await this.listAdministratorsUseCase.execute(command);
      console.log('✅ AuthApplicationService.listAdministrators - Use case completado');
      return result;
    } catch (error) {
      console.error('❌ AuthApplicationService.listAdministrators - Error:', error);
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