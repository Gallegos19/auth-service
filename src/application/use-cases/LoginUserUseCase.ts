import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { TokenServicePort } from '../ports/output/TokenServicePort';
import { PasswordServicePort } from '../ports/output/PasswordServicePort';
import { Email } from '../../domain/value-objects/Email';
import { UserSession } from '../../domain/entities/UserSession';
import { Token } from '../../domain/value-objects/Token';

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

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IUserSessionRepository,
    private readonly tokenService: TokenServicePort,
    private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    const email = new Email(command.email);

    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validar password
    const isPasswordValid = await this.passwordService.compare(
      command.password,
      user.getHashedPassword()
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Verificar que el usuario puede loguearse
    if (!user.canLogin()) {
      throw new Error('Account not active or not verified');
    }

    // Generar tokens
    const tokenPayload = {
      userId: user.getId().value,
      email: user.getEmail().value,
      role: user.getRole()
    };

    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = await this.tokenService.generateRefreshToken(tokenPayload);

    // Crear sesión
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

    return {
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
  }
}