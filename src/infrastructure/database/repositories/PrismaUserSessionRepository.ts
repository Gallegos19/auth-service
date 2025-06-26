import { PrismaClient } from '@prisma/client';
import { IUserSessionRepository } from '../../../domain/repositories/IUserSessionRepository';
import { UserSession } from '../../../domain/entities/UserSession';
import { UserId } from '../../../domain/value-objects/UserId';
import { Token } from '../../../domain/value-objects/Token';

export class PrismaUserSessionRepository implements IUserSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
        token_hash: session.getAccessToken().value, // En producción, hashear el token
        device_info: session.getDeviceInfo(),
        ip_address: session.getIpAddress(),
        is_active: session.getIsActive(),
        started_at: session.getCreatedAt()
      }
    });
  }

  async findByAccessToken(token: Token): Promise<UserSession | null> {
    const sessionRecord = await this.prisma.userSession.findFirst({
      where: { 
        token_hash: token.value, // En producción, comparar hash
        is_active: true
      }
    });

    if (!sessionRecord) return null;

    return this.toDomain(sessionRecord);
  }

  async findByRefreshToken(token: Token): Promise<UserSession | null> {
    // Implementar lógica similar para refresh token
    // Por simplicidad, asumimos que almacenamos ambos tokens
    return null; // Implementar según diseño específico
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

  async findActiveSessions(userId: UserId): Promise<UserSession[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: { 
        user_id: userId.value,
        is_active: true
      }
    });

    return sessions.map(session => this.toDomain(session));
  }

  private toDomain(record: any): UserSession {
    return new UserSession(
      record.id,
      new UserId(record.user_id),
      new Token(record.token_hash),
      new Token(''), // refresh token - implementar según diseño
      record.device_info,
      record.ip_address || '',
      record.started_at,
      record.is_active,
      record.created_at || record.started_at
    );
  }
}
