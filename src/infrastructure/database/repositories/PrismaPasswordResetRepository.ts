import { PrismaClient } from '@prisma/client';
import { IPasswordResetRepository } from '../../../domain/repositories/IPasswordResetRepository';
import { PasswordReset } from '../../../domain/entities/PasswordReset';
import { UserId } from '../../../domain/value-objects/UserId';
import { Token } from '../../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

@injectable()
export class PrismaPasswordResetRepository implements IPasswordResetRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(passwordReset: PasswordReset): Promise<void> {
    await this.prisma.passwordReset.upsert({
      where: { id: passwordReset.getId() },
      update: {
        is_used: passwordReset.getIsUsed(),
        // used_at: passwordReset.getUsedAt() // Agregar si tienes este campo
      },
      create: {
        id: passwordReset.getId(),
        user_id: passwordReset.getUserId().value,
        token: passwordReset.getToken().value,
        expires_at: passwordReset.getExpiresAt(),
        is_used: passwordReset.getIsUsed(),
        created_at: passwordReset.getCreatedAt()
      }
    });
  }

  async findByToken(token: string): Promise<PasswordReset | null> {
    const record = await this.prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findValidByUserId(userId: UserId): Promise<PasswordReset | null> {
    const record = await this.prisma.passwordReset.findFirst({
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

  async invalidateUserTokens(userId: UserId): Promise<void> {
    await this.prisma.passwordReset.updateMany({
      where: { user_id: userId.value },
      data: { is_used: true }
    });
  }

  private toDomain(record: any): PasswordReset {
    return new PasswordReset(
      record.id,
      new UserId(record.user_id),
      new Token(record.token),
      record.expires_at,
      record.is_used,
      record.used_at,
      record.created_at
    );
  }
}