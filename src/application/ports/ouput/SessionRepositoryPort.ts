import { UserSession } from '../../../domain/entities/UserSession';
import { UserId } from '../../../domain/value-objects/UserId';
import { Token } from '../../../domain/value-objects/Token';

export interface SessionRepositoryPort {
  createSession(session: UserSession): Promise<void>;
  findActiveSession(userId: UserId, deviceId?: string): Promise<UserSession | null>;
  validateSession(sessionId: string): Promise<boolean>;
  invalidateAllUserSessions(userId: UserId): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
  getSessionMetrics(userId: UserId): Promise<{
    activeSessions: number;
    totalSessions: number;
    lastActivity: Date;
  }>;
}