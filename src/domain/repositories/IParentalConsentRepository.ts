import { ParentalConsent } from '../entities/ParentalConsent';
import { UserId } from '../value-objects/UserId';

export interface IParentalConsentRepository {
  save(consent: ParentalConsent): Promise<void>;
  findByToken(token: string): Promise<ParentalConsent | null>;
  findPendingByUserId(userId: UserId): Promise<ParentalConsent | null>;
  findApprovedByUserId(userId: UserId): Promise<ParentalConsent | null>;
  invalidateUserConsents(userId: UserId): Promise<void>;
}
