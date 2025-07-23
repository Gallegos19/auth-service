// src/application/use-cases/SendEmailVerificationUseCase.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailVerificationRepository } from '../../domain/repositories/IEmailVerificationRepository';
import { EmailServicePort } from '../ports/ouput/EmailServicePort';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';
import { UserId } from '../../domain/value-objects/UserId';
import { EmailVerification } from '../../domain/entities/EmailVerification';
import { injectable, inject } from 'inversify';

export interface SendEmailVerificationCommand {
  userId: string;
}

@injectable()
export class SendEmailVerificationUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IEmailVerificationRepository') private readonly emailVerificationRepository: IEmailVerificationRepository,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: SendEmailVerificationCommand): Promise<void> {
    const userId = new UserId(command.userId);
    
    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar que no esté ya verificado
    if (user.getIsVerified()) {
      throw new Error('User email is already verified');
    }

    // Verificar que no requiera consentimiento parental (los menores se verifican automáticamente al aprobarse el consentimiento)
    if (user.needsParentalConsent()) {
      throw new Error('Minor users are verified through parental consent process');
    }

    // Invalidar verificaciones anteriores
    await this.emailVerificationRepository.invalidateUserVerifications(userId);

    // Generar nuevo token
    const verificationToken = await this.passwordService.generateResetToken(); // Reutilizamos el método
    
    // Crear nueva verificación
    const emailVerification = EmailVerification.create(
      userId,
      user.getEmail(),
      verificationToken
    );

    await this.emailVerificationRepository.save(emailVerification);

    // Enviar email
    await this.emailService.sendAccountVerificationEmail(
      user.getEmail().value,
      verificationToken
    );
  }
}

// src/application/use-cases/VerifyEmailUseCase.ts
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';
import { Email } from '../../domain/value-objects/Email';
import { EmailVerifiedEvent } from '../../domain/events/EmailVerifiedEvent';

export interface VerifyEmailCommand {
  verificationToken: string;
}

export interface VerifyEmailResponse {
  userId: string;
  email: string;
  verified: boolean;
  canLogin: boolean;
}

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IEmailVerificationRepository') private readonly emailVerificationRepository: IEmailVerificationRepository,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResponse> {
    // Buscar verificación por token
    const verification = await this.emailVerificationRepository.findByToken(command.verificationToken);
    if (!verification) {
      throw new Error('Invalid verification token');
    }

    if (!verification.isValid()) {
      throw new Error('Verification token has expired or already been used');
    }

    // Buscar usuario
    const user = await this.userRepository.findById(verification.getUserId());
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar email del usuario
    user.verifyEmail(); // Esto marca isVerified = true y accountStatus = 'active'
    await this.userRepository.save(user);

    // Marcar verificación como usada
    verification.verify();
    await this.emailVerificationRepository.save(verification);

    // Publicar evento
    const event = new EmailVerifiedEvent(
      user.getId().value,
      user.getEmail().value,
      new Date()
    );
    await this.eventPublisher.publish(event);

    // Enviar email de bienvenida después de verificar exitosamente
    try {
      await this.emailService.sendWelcomeEmail(
        user.getEmail().value,
        user.getFirstName()
      );
      console.log('✅ Email de bienvenida enviado exitosamente a:', user.getEmail().value);
    } catch (emailError) {
      console.warn('⚠️ Error enviando email de bienvenida (no crítico):', emailError);
      // No lanzamos el error para no afectar el flujo principal de verificación
    }

    return {
      userId: user.getId().value,
      email: user.getEmail().value,
      verified: true,
      canLogin: user.canLogin()
    };
  }
}

// src/application/use-cases/ResendEmailVerificationUseCase.ts
export interface ResendEmailVerificationCommand {
  email: string;
}

@injectable()
export class ResendEmailVerificationUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IEmailVerificationRepository') private readonly emailVerificationRepository: IEmailVerificationRepository,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: ResendEmailVerificationCommand): Promise<void> {
    const email = new Email(command.email);
    
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe
      return;
    }

    if (user.getIsVerified()) {
      throw new Error('User email is already verified');
    }

    // Rate limiting: verificar si ya se envió uno recientemente
    const existingVerification = await this.emailVerificationRepository.findPendingByUserId(user.getId());
    if (existingVerification) {
      const timeSinceCreated = Date.now() - existingVerification.getCreatedAt().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceCreated < fiveMinutes) {
        throw new Error('Verification email was sent recently. Please wait before requesting another.');
      }
    }

    // Invalidar verificaciones anteriores
    await this.emailVerificationRepository.invalidateUserVerifications(user.getId());

    // Crear nueva verificación
    const verificationToken = await this.passwordService.generateResetToken();
    const emailVerification = EmailVerification.create(
      user.getId(),
      user.getEmail(),
      verificationToken
    );

    await this.emailVerificationRepository.save(emailVerification);

    // Enviar email
    await this.emailService.sendAccountVerificationEmail(
      user.getEmail().value,
      verificationToken
    );
  }
}