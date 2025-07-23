import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Age } from '../../domain/value-objects/Age';
import { User } from '../../domain/entities/User';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';

export interface CreateModeratorCommand {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  firstName?: string;
  lastName?: string;
}

export interface CreateModeratorResponse {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
  isVerified: boolean;
  message: string;
}

@injectable()
export class CreateModeratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort,
    @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(command: CreateModeratorCommand): Promise<CreateModeratorResponse> {
    try {
      console.log('🔄 CreateModeratorUseCase.execute - Iniciando');
      
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

      // Crear moderador con privilegios especiales
      const { user, event } = User.createModerator(
        email,
        password,
        age,
        command.firstName,
        command.lastName
      );

      console.log('✅ Moderador creado con account_status: active y is_verified: true');

      // Persistir usuario
      await this.userRepository.save(user);
      console.log('✅ Moderador persistido en base de datos');

      // Publicar evento (non-blocking)
      try {
        await this.eventPublisher.publish(event);
        console.log('✅ Evento publicado correctamente');
      } catch (eventError) {
        console.warn('⚠️ Error publicando evento (no crítico):', eventError);
      }

      const response: CreateModeratorResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        message: 'Moderator created successfully with active status and verified email'
      };

      console.log('✅ CreateModeratorUseCase completado:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error en CreateModeratorUseCase:', error);
      throw error;
    }
  }
}