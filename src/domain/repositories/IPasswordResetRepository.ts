import { PasswordReset } from '../entities/PasswordReset';
import { UserId } from '../value-objects/UserId';

export interface IPasswordResetRepository {
  save(passwordReset: PasswordReset): Promise<void>;
  findByToken(token: string): Promise<PasswordReset | null>;
  findValidByUserId(userId: UserId): Promise<PasswordReset | null>;
  invalidateUserTokens(userId: UserId): Promise<void>;
}