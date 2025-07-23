import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';

import { UserRole } from '../entities/User';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByEmailAndStatus(email: Email, status: string): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  updateLastLogin(userId: UserId): Promise<void>;
  countUsers(): Promise<number>;
  findActiveUsers(limit?: number, offset?: number): Promise<User[]>;
  
  // Nuevos métodos para CRUD de roles
  findByRole(role: UserRole, limit?: number, offset?: number, status?: string): Promise<User[]>;
  countByRole(role: UserRole, status?: string): Promise<number>;
}