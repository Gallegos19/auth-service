import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { UserId } from '../../../domain/value-objects/UserId';

export interface UserRepositoryPort {
  createUser(user: User): Promise<void>;
  getUserById(userId: UserId): Promise<User | null>;
  getUserByEmail(email: Email): Promise<User | null>;
  updateUser(user: User): Promise<void>;
  deleteUser(userId: UserId): Promise<void>;
  verifyUserEmail(userId: UserId): Promise<void>;
  changeUserStatus(userId: UserId, status: string): Promise<void>;
  getUsersRequiringParentalConsent(): Promise<User[]>;
}