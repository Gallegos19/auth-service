import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import 'reflect-metadata';

// Use Cases
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { LogoutUserUseCase } from '../../application/use-cases/LogoutUserUseCase';
import { ValidateTokenUseCase } from '../../application/use-cases/ValidateTokenUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshTokenUseCase';
import { RequestParentalConsentUseCase } from '../../application/use-cases/RequestParentalConsentUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ApproveParentalConsentUseCase } from '../../application/use-cases/ApproveParentalConsentUseCase';

// Services
import { BcryptPasswordService } from '../security/BcrytPasswordService';
import { AuthApplicationService } from '../../application/services/AuthApplicationService';
import { TokenValidationService } from '../../application/services/TokenValidationService';
import { JwtTokenService } from '../security/JwtTokenService';
import { EmailService } from '../external/EmailService';
import { RabbitMQEventPublisher } from '../messaging/RabbitMQEventPublisher';

// Repositories
import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';
import { PrismaUserSessionRepository } from '../database/repositories/PrismaUserSessionRepository';
import { PrismaParentalConsentRepository } from '../database/repositories/PrismaParentalConsentRepository';

// Controllers
import { AuthController } from '../web/controllers/AuthController';
import { TokenController } from '../web/controllers/TokenController';
import { ParentalConsentController } from '../web/controllers/ParentalConsentController';

// Types
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { IParentalConsentRepository } from '../../domain/repositories/IParentalConsentRepository';
import { TokenServicePort } from '../../application/ports/ouput/TokenServicePort';
import { PasswordServicePort } from '../../application/ports/ouput/PasswordServicePort';
import { AuthCommandPort } from '../../application/ports/input/AuthCommandPort';
import { AuthQueryPort } from '../../application/ports/input/AuthQueryPort';
import { EmailServicePort } from '../../application/ports/ouput/EmailServicePort';
import { EventPublisherPort } from '../../application/ports/ouput/EventPublisherPort';

// Configuration
import { config } from './enviroment';

const container = new Container();

// ==================
// INFRASTRUCTURE
// ==================

// Database
container.bind<PrismaClient>('PrismaClient').toConstantValue(new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: config.nodeEnv === 'development' ? 'pretty' : 'minimal'
}));

// External Services
container.bind<TokenServicePort>('TokenServicePort').to(JwtTokenService).inSingletonScope();
container.bind<PasswordServicePort>('PasswordServicePort').to(BcryptPasswordService).inSingletonScope();
container.bind<EmailServicePort>('EmailServicePort').to(EmailService).inSingletonScope();
container.bind<EventPublisherPort>('EventPublisherPort').to(RabbitMQEventPublisher).inSingletonScope();

// ==================
// REPOSITORIES
// ==================
container.bind<IUserRepository>('IUserRepository').to(PrismaUserRepository);
container.bind<IUserSessionRepository>('IUserSessionRepository').to(PrismaUserSessionRepository);
container.bind<IParentalConsentRepository>('IParentalConsentRepository').to(PrismaParentalConsentRepository);

// ==================
// USE CASES
// ==================
container.bind<RegisterUserUseCase>('RegisterUserUseCase').to(RegisterUserUseCase);
container.bind<LoginUserUseCase>('LoginUserUseCase').to(LoginUserUseCase);
container.bind<LogoutUserUseCase>('LogoutUserUseCase').to(LogoutUserUseCase);
container.bind<ValidateTokenUseCase>('ValidateTokenUseCase').to(ValidateTokenUseCase);
container.bind<RefreshTokenUseCase>('RefreshTokenUseCase').to(RefreshTokenUseCase);
container.bind<RequestParentalConsentUseCase>('RequestParentalConsentUseCase').to(RequestParentalConsentUseCase);
container.bind<ForgotPasswordUseCase>('ForgotPasswordUseCase').to(ForgotPasswordUseCase);
container.bind<ApproveParentalConsentUseCase>('ApproveParentalConsentUseCase').to(ApproveParentalConsentUseCase);

// ==================
// APPLICATION SERVICES
// ==================
container.bind<TokenValidationService>('TokenValidationService').to(TokenValidationService);
container.bind<AuthApplicationService>('AuthApplicationService').to(AuthApplicationService);

// Port bindings
container.bind<AuthCommandPort>('AuthCommandPort').toService('AuthApplicationService');
container.bind<AuthQueryPort>('AuthQueryPort').toService('AuthApplicationService');

// ==================
// CONTROLLERS
// ==================
container.bind<AuthController>('AuthController').to(AuthController);
container.bind<TokenController>('TokenController').to(TokenController);
container.bind<ParentalConsentController>('ParentalConsentController').to(ParentalConsentController);

// Configuration binding
container.bind('Config').toConstantValue(config);

export { container };

// Cleanup function
export async function cleanup(): Promise<void> {
  const prisma = container.get<PrismaClient>('PrismaClient');
  await prisma.$disconnect();
  
  const eventPublisher = container.get<EventPublisherPort>('EventPublisherPort');
  if ('close' in eventPublisher) {
    await (eventPublisher as any).close();
  }
}