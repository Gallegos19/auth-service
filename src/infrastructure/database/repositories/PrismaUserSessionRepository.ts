// src/infrastructure/database/repositories/PrismaUserSessionRepository.ts
import { PrismaClient } from '@prisma/client';
import { IUserSessionRepository } from '../../../domain/repositories/IUserSessionRepository';
import { UserSession } from '../../../domain/entities/UserSession';
import { UserId } from '../../../domain/value-objects/UserId';
import { Token } from '../../../domain/value-objects/Token';
import { injectable, inject } from 'inversify';

@injectable()
export class PrismaUserSessionRepository implements IUserSessionRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(session: UserSession): Promise<void> {
    await this.prisma.userSession.upsert({
      where: { id: session.getId() },
      update: {
        is_active: session.getIsActive(),
        updated_at: new Date()
      },
      create: {
        id: session.getId(),
        user_id: session.getUserId().value,
        token_hash: this.hashToken(session.getAccessToken().value),
        refresh_token_hash: this.hashToken(session.getRefreshToken().value),
        device_info: session.getDeviceInfo() || {},
        ip_address: session.getIpAddress(),
        expires_at: session.getExpiresAt(),
        is_active: session.getIsActive(),
        started_at: session.getCreatedAt()
      }
    });
  }

  async findByAccessToken(token: Token): Promise<UserSession | null> {
    const tokenHash = this.hashToken(token.value);
    const sessionRecord = await this.prisma.userSession.findFirst({
      where: { 
        token_hash: tokenHash,
        is_active: true
      }
    });

    if (!sessionRecord) return null;
    return this.toDomain(sessionRecord, token);
  }

  async findByRefreshToken(token: Token): Promise<UserSession | null> {
    const tokenHash = this.hashToken(token.value);
    const sessionRecord = await this.prisma.userSession.findFirst({
      where: { 
        refresh_token_hash: tokenHash,
        is_active: true
      }
    });

    if (!sessionRecord) return null;
    return this.toDomain(sessionRecord, undefined, token);
  }

  async findActiveSessions(userId: UserId): Promise<UserSession[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: { 
        user_id: userId.value,
        is_active: true
      },
      orderBy: { started_at: 'desc' }
    });

    return sessions.map((session: any) => this.toDomain(session));
  }

  async invalidateUserSessions(userId: UserId): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { user_id: userId.value },
      data: { 
        is_active: false,
        ended_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { 
        is_active: false,
        ended_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await this.prisma.userSession.deleteMany({
      where: {
        OR: [
          { started_at: { lt: thirtyDaysAgo } },
          { is_active: false, ended_at: { lt: thirtyDaysAgo } }
        ]
      }
    });
  }

  async countActiveSessions(userId: UserId): Promise<number> {
    return this.prisma.userSession.count({
      where: { 
        user_id: userId.value,
        is_active: true
      }
    });
  }

  async countActiveSessionsByUser(userId: UserId): Promise<number> {
    return this.countActiveSessions(userId); // Reutilizar método existente
  }

  async revokeAllUserSessions(userId: UserId): Promise<number> {
    // Contar sesiones activas antes de revocarlas
    const activeSessionsCount = await this.countActiveSessions(userId);
    
    // Revocar todas las sesiones del usuario
    await this.prisma.userSession.updateMany({
      where: { 
        user_id: userId.value,
        is_active: true
      },
      data: { 
        is_active: false,
        ended_at: new Date(),
        updated_at: new Date()
      }
    });

    return activeSessionsCount;
  }

  private toDomain(record: any, accessToken?: Token, refreshToken?: Token): UserSession {
    return new UserSession(
      record.id,
      new UserId(record.user_id),
      accessToken || new Token('mock-access-token'), // En producción, no almacenamos el token real
      refreshToken || new Token('mock-refresh-token'), // En producción, no almacenamos el token real
      record.device_info,
      record.ip_address || '',
      record.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      record.is_active,
      record.started_at
    );
  }

  private hashToken(token: string): string {
    // En producción, usar un hash seguro (SHA-256)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}