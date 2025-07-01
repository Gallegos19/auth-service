// src/infrastructure/database/repositories/PrismaEmailVerificationRepository.ts
import { PrismaClient } from '@prisma/client';
import { IEmailVerificationRepository } from '../../../domain/repositories/IEmailVerificationRepository';
import { EmailVerification } from '../../../domain/entities/EmailVerification';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { Token } from '../../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

@injectable()
export class PrismaEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(verification: EmailVerification): Promise<void> {
    await this.prisma.emailVerification.upsert({
      where: { id: verification.getId() },
      update: {
        is_used: verification.getIsUsed(),
        used_at: verification.getUsedAt(),
        updated_at: new Date()
      },
      create: {
        id: verification.getId(),
        user_id: verification.getUserId().value,
        email: verification.getEmail().value,
        verification_token: verification.getVerificationToken().value,
        expires_at: verification.getExpiresAt(),
        is_used: verification.getIsUsed(),
        used_at: verification.getUsedAt(),
        created_at: verification.getCreatedAt()
      }
    });
  }

  async findByToken(token: string): Promise<EmailVerification | null> {
    const record = await this.prisma.emailVerification.findUnique({
      where: { verification_token: token }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findPendingByUserId(userId: UserId): Promise<EmailVerification | null> {
    const record = await this.prisma.emailVerification.findFirst({
      where: { 
        user_id: userId.value,
        is_used: false,
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findPendingByEmail(email: Email): Promise<EmailVerification | null> {
    const record = await this.prisma.emailVerification.findFirst({
      where: { 
        email: email.value,
        is_used: false,
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async invalidateUserVerifications(userId: UserId): Promise<void> {
    await this.prisma.emailVerification.updateMany({
      where: { user_id: userId.value },
      data: { 
        is_used: true,
        used_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async deleteExpiredVerifications(): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    await this.prisma.emailVerification.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { created_at: { lt: threeDaysAgo } }
        ]
      }
    });
  }

  private toDomain(record: any): EmailVerification {
    return new EmailVerification(
      record.id,
      new UserId(record.user_id),
      new Email(record.email),
      new Token(record.verification_token),
      record.expires_at,
      record.is_used,
      record.used_at,
      record.created_at
    );
  }
}