import { EmailVerification } from '../entities/EmailVerification';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface IEmailVerificationRepository {
  save(verification: EmailVerification): Promise<void>;
  findByToken(token: string): Promise<EmailVerification | null>;
  findPendingByUserId(userId: UserId): Promise<EmailVerification | null>;
  findPendingByEmail(email: Email): Promise<EmailVerification | null>;
  invalidateUserVerifications(userId: UserId): Promise<void>;
  deleteExpiredVerifications(): Promise<void>;
}