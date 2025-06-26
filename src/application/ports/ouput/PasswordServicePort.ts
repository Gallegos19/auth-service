export interface PasswordServicePort {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
  generateResetToken(): Promise<string>;
  validatePasswordStrength(password: string): boolean;
}