import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordResetRepository } from '../../domain/repositories/IPasswordResetRepository';

import { Email } from '../../domain/value-objects/Email';
import { PasswordReset } from '../../domain/entities/PasswordReset';
import { inject, injectable } from 'inversify';
import { EmailServicePort } from '../ports/ouput/EmailServicePort';
import { PasswordServicePort } from '../ports/ouput/PasswordServicePort';

export interface ForgotPasswordCommand {
  email: string;
}

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IPasswordResetRepository') private readonly passwordResetRepository: IPasswordResetRepository,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort,
    @inject('PasswordServicePort') private readonly passwordService: PasswordServicePort
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const email = new Email(command.email);
    
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return;
    }

    // Invalidar tokens de reset anteriores
    await this.passwordResetRepository.invalidateUserTokens(user.getId());

    // Generar nuevo token de reset
    const resetToken = await this.passwordService.generateResetToken();
    const passwordReset = PasswordReset.create(user.getId(), resetToken);

    await this.passwordResetRepository.save(passwordReset);

    // Enviar email
    await this.emailService.sendPasswordResetEmail(
      user.getEmail().value,
      resetToken
    );
  }
}