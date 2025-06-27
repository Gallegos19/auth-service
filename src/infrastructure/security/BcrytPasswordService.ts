import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config/enviroment';
import { PasswordServicePort } from '../../application/ports/ouput/PasswordServicePort';

export class BcryptPasswordService implements PasswordServicePort {
  private readonly saltRounds = config.bcrypt.saltRounds;

  async hash(plainPassword: string): Promise<string> {
    if (!this.validatePasswordStrength(plainPassword)) {
      throw new Error('Password does not meet security requirements');
    }
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateResetToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  validatePasswordStrength(password: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}