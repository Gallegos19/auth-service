// src/application/use-cases/RegisterUserUseCase.ts (ACTUALIZADO)
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Age } from '../../domain/value-objects/Age';
import { User } from '../../domain/entities/User';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';
import { EmailServicePort } from '../ports/ouput/EmailServicePort';
import { IEmailVerificationRepository } from '../../domain/repositories/IEmailVerificationRepository';
import { EmailVerification } from '../../domain/entities/EmailVerification';

export interface RegisterUserCommand {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  firstName?: string;
  lastName?: string;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
  requiresParentalConsent: boolean;
  requiresEmailVerification: boolean;
  accountStatus: string;
  message: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IEmailVerificationRepository') private readonly emailVerificationRepository: IEmailVerificationRepository,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    try {
      console.log('🔄 RegisterUserUseCase.execute - Iniciando');
      
      // Validaciones
      if (command.password !== command.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const email = new Email(command.email);
      const age = new Age(command.age);

      console.log('✅ Value objects creados correctamente');

      // Verificar que el email no exista
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      console.log('✅ Email disponible');

      // Hash password
      const hashedPassword = await this.passwordService.hash(command.password);
      const password = new Password(hashedPassword);

      console.log('✅ Password hasheado');

      // Crear usuario y evento
      const { user, event } = User.create(
        email,
        password,
        age,
        command.firstName,
        command.lastName
      );

      console.log('✅ Usuario y evento creados');

      // Persistir usuario
      await this.userRepository.save(user);
      console.log('✅ Usuario persistido en base de datos');

      // Determinar siguiente acción según la edad
      const requiresParentalConsent = user.needsParentalConsent();
      const requiresEmailVerification = !requiresParentalConsent; // Solo adultos necesitan verificar email

      let message = 'User registered successfully';

      if (requiresParentalConsent) {
        // Menores de 13: necesitan consentimiento parental
        message = 'Registration successful. Parental consent required to activate account.';
      } else {
        // Mayores de 13: necesitan verificar email
        try {
          // Generar y enviar verificación de email automáticamente
          const verificationToken = await this.passwordService.generateResetToken();
          const emailVerification = EmailVerification.create(
            user.getId(),
            user.getEmail(),
            verificationToken
          );

          await this.emailVerificationRepository.save(emailVerification);
          await this.emailService.sendAccountVerificationEmail(
            user.getEmail().value,
            verificationToken
          );

          message = 'Registration successful. Please check your email to verify your account.';
          console.log('✅ Email de verificación enviado');
        } catch (emailError) {
          console.warn('⚠️ Error enviando email de verificación (no crítico):', emailError);
          message = 'Registration successful. You can request email verification later.';
        }
      }

      // Publicar evento (non-blocking)
      try {
        await this.eventPublisher.publish(event);
        console.log('✅ Evento publicado correctamente');
      } catch (eventError) {
        console.warn('⚠️ Error publicando evento (no crítico):', eventError);
      }

      const response: RegisterUserResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        requiresParentalConsent,
        requiresEmailVerification,
        accountStatus: user.getAccountStatus(),
        message
      };

      console.log('✅ RegisterUserUseCase completado:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error en RegisterUserUseCase:', error);
      throw error;
    }
  }
}