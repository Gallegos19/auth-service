import { UserSession } from '../entities/UserSession';
import { UserId } from '../value-objects/UserId';
import { Token } from '../value-objects/Token';

export interface IUserSessionRepository {
  save(session: UserSession): Promise<void>;
  findByAccessToken(token: Token): Promise<UserSession | null>;
  findByRefreshToken(token: Token): Promise<UserSession | null>;
  findActiveSessions(userId: UserId): Promise<UserSession[]>;
  invalidateUserSessions(userId: UserId): Promise<void>;
  invalidateSession(sessionId: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  countActiveSessions(userId: UserId): Promise<number>;
  
  // Nuevos métodos para CRUD
  countActiveSessionsByUser(userId: UserId): Promise<number>;
  revokeAllUserSessions(userId: UserId): Promise<number>; // Retorna número de sesiones revocadas
}