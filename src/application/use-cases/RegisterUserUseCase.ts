// src/application/use-cases/RegisterUserUseCase.ts
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Age } from '../../domain/value-objects/Age';
import { User } from '../../domain/entities/User';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';

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
  accountStatus: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort
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

      // Publicar evento (non-blocking)
      try {
        await this.eventPublisher.publish(event);
        console.log('✅ Evento publicado correctamente');
      } catch (eventError) {
        console.warn('⚠️ Error publicando evento (no crítico):', eventError);
        // No lanzamos error aquí porque el usuario ya fue creado exitosamente
      }

      const response = {
        userId: user.getId().value,
        email: user.getEmail().value,
        requiresParentalConsent: user.needsParentalConsent(),
        accountStatus: user.getAccountStatus()
      };

      console.log('✅ RegisterUserUseCase completado:', response);

      return response;
      
    } catch (error) {
      console.error('❌ Error en RegisterUserUseCase:', error);
      throw error; // Re-lanzar para que sea manejado por el controller
    }
  }
}