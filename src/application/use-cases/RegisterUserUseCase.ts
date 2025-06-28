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
    // Validaciones
    if (command.password !== command.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const email = new Email(command.email);
    const age = new Age(command.age);

    // Verificar que el email no exista
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(command.password);
    const password = new Password(hashedPassword);

    // Crear usuario y evento
    const { user, event } = User.create(
      email,
      password,
      age,
      command.firstName,
      command.lastName
    );

    // Persistir usuario
    await this.userRepository.save(user);

    // Publicar evento
    await this.eventPublisher.publish(event);

    return {
      userId: user.getId().value,
      email: user.getEmail().value,
      requiresParentalConsent: user.needsParentalConsent(),
      accountStatus: user.getAccountStatus()
    };
  }
}