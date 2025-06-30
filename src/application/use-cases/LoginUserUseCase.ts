// src/application/use-cases/LoginUserUseCase.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { TokenServicePort } from '../ports/ouput/TokenServicePort';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';
import { Email } from '../../domain/value-objects/Email';
import { UserSession } from '../../domain/entities/UserSession';
import { Token } from '../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

export interface LoginUserCommand {
  email: string;
  password: string;
  deviceInfo?: any;
  ipAddress: string;
}

export interface LoginUserResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isVerified: boolean;
  };
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IUserSessionRepository') private readonly sessionRepository: IUserSessionRepository,
    @inject('TokenServicePort') private readonly tokenService: TokenServicePort,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    try {
      console.log('🔄 LoginUserUseCase.execute - Iniciando login');
      console.log('Dependencies check:', {
        userRepository: !!this.userRepository,
        sessionRepository: !!this.sessionRepository,
        tokenService: !!this.tokenService,
        passwordService: !!this.passwordService
      });

      const email = new Email(command.email);
      console.log('✅ Email value object creado');

      // Buscar usuario
      console.log('🔍 Buscando usuario por email...');
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      console.log('✅ Usuario encontrado');

      // Validar password
      console.log('🔒 Validando password...');
      const isPasswordValid = await this.passwordService.compare(
        command.password,
        user.getHashedPassword()
      );
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      console.log('✅ Password válido');

      // Verificar que el usuario puede loguearse
      if (!user.canLogin()) {
        throw new Error('Account not active or not verified');
      }
      console.log('✅ Usuario puede hacer login');

      // Generar tokens
      console.log('🔑 Generando tokens...');
      const tokenPayload = {
        userId: user.getId().value,
        email: user.getEmail().value,
        role: user.getRole()
      };

      const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
      const refreshToken = await this.tokenService.generateRefreshToken(tokenPayload);
      console.log('✅ Tokens generados');

      // Crear sesión
      console.log('📝 Creando sesión...');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
      const session = UserSession.create(
        user.getId(),
        new Token(accessToken),
        new Token(refreshToken),
        command.deviceInfo,
        command.ipAddress,
        expiresAt
      );

      // Invalidar sesiones anteriores del mismo dispositivo (opcional)
      await this.sessionRepository.invalidateUserSessions(user.getId());

      // Guardar nueva sesión
      await this.sessionRepository.save(session);
      console.log('✅ Sesión guardada');

      const response = {
        userId: user.getId().value,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hora
        tokenType: 'Bearer',
        user: {
          email: user.getEmail().value,
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          role: user.getRole(),
          isVerified: user.getIsVerified()
        }
      };

      console.log('✅ LoginUserUseCase completado');
      return response;

    } catch (error) {
      console.error('❌ Error en LoginUserUseCase:', error);
      throw error;
    }
  }
}