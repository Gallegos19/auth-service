import bcrypt from 'bcrypt';
import { PasswordServicePort } from '../../application/ports/output/PasswordServicePort';

export class BcryptPasswordService implements PasswordServicePort {
  private readonly saltRounds = 12;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}