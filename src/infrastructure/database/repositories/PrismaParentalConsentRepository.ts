import { PrismaClient } from '@prisma/client';
import { IParentalConsentRepository } from '../../../domain/repositories/IParentalConsentRepository';
import { ParentalConsent } from '../../../domain/entities/ParentalConsent';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { Token } from '../../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

@injectable()
export class PrismaParentalConsentRepository implements IParentalConsentRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(consent: ParentalConsent): Promise<void> {
    await this.prisma.parentalConsent.upsert({
      where: { id: consent.getId() },
      update: {
        is_approved: consent.getIsApproved(),
        approved_at: consent.getApprovedAt(),
        updated_at: new Date()
      },
      create: {
        id: consent.getId(),
        minor_user_id: consent.getMinorUserId().value,
        parent_email: consent.getParentEmail().value,
        parent_name: consent.getParentName(),
        relationship: consent.getRelationship(),
        consent_token: consent.getConsentToken(),
        is_approved: consent.getIsApproved(),
        approved_at: consent.getApprovedAt(),
        expires_at: consent.getExpiresAt()
      }
    });
  }

  async findByToken(token: string): Promise<ParentalConsent | null> {
    const record = await this.prisma.parentalConsent.findUnique({
      where: { consent_token: token }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findPendingByUserId(userId: UserId): Promise<ParentalConsent | null> {
    const record = await this.prisma.parentalConsent.findFirst({
      where: { 
        minor_user_id: userId.value,
        is_approved: false,
        expires_at: { gt: new Date() }
      }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findApprovedByUserId(userId: UserId): Promise<ParentalConsent | null> {
    const record = await this.prisma.parentalConsent.findFirst({
      where: { 
        minor_user_id: userId.value,
        is_approved: true
      }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async invalidateUserConsents(userId: UserId): Promise<void> {
    await this.prisma.parentalConsent.updateMany({
      where: { minor_user_id: userId.value },
      data: { 
        expires_at: new Date(), // Expirar inmediatamente
        updated_at: new Date()
      }
    });
  }

  private toDomain(record: any): ParentalConsent {
    return new ParentalConsent(
      record.id,
      new UserId(record.minor_user_id),
      new Email(record.parent_email),
      record.parent_name,
      record.relationship,
      new Token(record.consent_token),
      record.is_approved,
      record.approved_at,
      record.expires_at,
      record.created_at
    );
  }
}