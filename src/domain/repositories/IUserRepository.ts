import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByEmailAndStatus(email: Email, status: string): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  updateLastLogin(userId: UserId): Promise<void>;
  countUsers(): Promise<number>;
  findActiveUsers(limit?: number, offset?: number): Promise<User[]>;
}