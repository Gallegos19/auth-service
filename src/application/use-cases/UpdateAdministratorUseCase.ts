import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';

export interface UpdateAdministratorCommand {
  administratorId: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  isVerified?: boolean;
}

export interface UpdateAdministratorResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountStatus: string;
  isVerified: boolean;
  message: string;
}

@injectable()
export class UpdateAdministratorUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: UpdateAdministratorCommand): Promise<UpdateAdministratorResponse> {
    try {
      console.log('🔄 UpdateAdministratorUseCase.execute - Iniciando');
      
      const userId = new UserId(command.administratorId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Administrator not found');
      }

      if (user.getRole() !== 'administrator') {
        throw new Error('User is not an administrator');
      }

      // Validar email si se proporciona
      if (command.email && command.email !== user.getEmail().value) {
        const emailExists = await this.userRepository.findByEmail(new Email(command.email));
        if (emailExists) {
          throw new Error('Email already in use');
        }
      }

      // Validar contraseña si se proporciona
      if (command.password) {
        if (command.password !== command.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Actualizar campos
      if (command.firstName !== undefined) {
        // TODO: Implementar setter en User entity
        (user as any).firstName = command.firstName;
      }

      if (command.lastName !== undefined) {
        // TODO: Implementar setter en User entity
        (user as any).lastName = command.lastName;
      }

      if (command.password) {
        const hashedPassword = await this.passwordService.hash(command.password);
        user.updatePassword(new Password(hashedPassword));
      }

      if (command.accountStatus) {
        // TODO: Implementar método para cambiar status
        if (command.accountStatus === 'suspended') {
          user.suspend();
        } else if (command.accountStatus === 'active') {
          user.activate();
        }
      }

      // Guardar cambios
      await this.userRepository.save(user);

      const response: UpdateAdministratorResponse = {
        userId: user.getId().value,
        email: user.getEmail().value,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        role: user.getRole(),
        accountStatus: user.getAccountStatus(),
        isVerified: user.getIsVerified(),
        message: 'Administrator updated successfully'
      };

      console.log('✅ UpdateAdministratorUseCase completado');
      return response;
      
    } catch (error) {
      console.error('❌ Error en UpdateAdministratorUseCase:', error);
      throw error;
    }
  }
}