// src/infrastructure/config/container.ts
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
import { PrismaPasswordResetRepository } from '../database/repositories/PrismaPasswordResetRepository';

// Controllers
import { AuthController } from '../web/controllers/AuthController';
import { TokenController } from '../web/controllers/TokenController';
import { ParentalConsentController } from '../web/controllers/ParentalConsentController';

// Types
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { IParentalConsentRepository } from '../../domain/repositories/IParentalConsentRepository';
import { IPasswordResetRepository } from '../../domain/repositories/IPasswordResetRepository';
import { TokenServicePort } from '../../application/ports/ouput/TokenServicePort';
import { PasswordServicePort } from '../../application/ports/ouput/PasswordServicePort';
import { AuthCommandPort } from '../../application/ports/input/AuthCommandPort';
import { AuthQueryPort } from '../../application/ports/input/AuthQueryPort';
import { EmailServicePort } from '../../application/ports/ouput/EmailServicePort';
import { EventPublisherPort } from '../../application/ports/ouput/EventPublisherPort';

// Configuration
import { config } from './enviroment';

const container = new Container();

console.log('🔧 Configurando container de dependencias...');

// External Services
import { GmailEmailService } from '../external/GmailEmailService';

// ==================
// INFRASTRUCTURE
// ==================

// Database
const prismaClient = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: config.nodeEnv === 'development' ? 'pretty' : 'minimal'
});

container.bind<PrismaClient>('PrismaClient').toConstantValue(prismaClient);
console.log('✅ PrismaClient configurado');

// External Services
container.bind<TokenServicePort>('TokenServicePort').to(JwtTokenService).inSingletonScope();
container.bind<PasswordServicePort>('PasswordServicePort').to(BcryptPasswordService).inSingletonScope();

// Email Service - Usar Gmail real si las credenciales están configuradas
if (config.gmail?.clientId && config.gmail?.clientSecret && config.gmail?.refreshToken) {
  container.bind<EmailServicePort>('EmailServicePort').to(GmailEmailService).inSingletonScope();
  console.log('✅ Gmail EmailService configurado');
} else {
  // Fallback a mock service para desarrollo
  const mockEmailService = {
    async sendParentalConsentEmail(parentEmail: string, consentToken: string, minorName: string): Promise<void> {
      console.log(`📧 [MOCK] Email de consentimiento parental a ${parentEmail} para ${minorName}`);
      console.log(`🔗 [MOCK] Token: ${consentToken}`);
    },
    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
      console.log(`📧 [MOCK] Email de reset de password a ${email}`);
      console.log(`🔗 [MOCK] Token: ${resetToken}`);
    },
    async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
      console.log(`📧 [MOCK] Email de bienvenida a ${email} (${firstName || 'Usuario'})`);
    },
    async sendAccountVerificationEmail(email: string, verificationToken: string): Promise<void> {
      console.log(`📧 [MOCK] Email de verificación a ${email}`);
      console.log(`🔗 [MOCK] Token: ${verificationToken}`);
    }
  };
  container.bind<EmailServicePort>('EmailServicePort').toConstantValue(mockEmailService);
  console.log('⚠️ Mock EmailService configurado (configura Gmail para emails reales)');
}

container.bind<EventPublisherPort>('EventPublisherPort').to(RabbitMQEventPublisher).inSingletonScope();

console.log('✅ Servicios externos configurados');

// ==================
// REPOSITORIES
// ==================
container.bind<IUserRepository>('IUserRepository').to(PrismaUserRepository);
container.bind<IUserSessionRepository>('IUserSessionRepository').to(PrismaUserSessionRepository);
container.bind<IParentalConsentRepository>('IParentalConsentRepository').to(PrismaParentalConsentRepository);
container.bind<IPasswordResetRepository>('IPasswordResetRepository').to(PrismaPasswordResetRepository);
console.log('✅ Repositorios configurados');

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
console.log('✅ Use Cases configurados');

// ==================
// APPLICATION SERVICES
// ==================
container.bind<TokenValidationService>('TokenValidationService').to(TokenValidationService);
container.bind<AuthApplicationService>('AuthApplicationService').to(AuthApplicationService);

// Port bindings
container.bind<AuthCommandPort>('AuthCommandPort').toService('AuthApplicationService');
container.bind<AuthQueryPort>('AuthQueryPort').toService('AuthApplicationService');
console.log('✅ Application Services configurados');

// ==================
// CONTROLLERS
// ==================
container.bind<AuthController>('AuthController').to(AuthController);
container.bind<TokenController>('TokenController').to(TokenController);
container.bind<ParentalConsentController>('ParentalConsentController').to(ParentalConsentController);
console.log('✅ Controllers configurados');

// Configuration binding
container.bind('Config').toConstantValue(config);

console.log('✅ Container de dependencias configurado completamente');

export { container };

// Cleanup function
export async function cleanup(): Promise<void> {
  console.log('🧹 Iniciando cleanup...');
  
  try {
    await prismaClient.$disconnect();
    console.log('✅ PrismaClient desconectado');
  } catch (error) {
    console.error('❌ Error desconectando PrismaClient:', error);
  }
  
  // Los servicios mock no necesitan cleanup especial
  console.log('✅ Cleanup completado');
}