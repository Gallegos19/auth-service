import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { UserId } from '../../../domain/value-objects/UserId';
import { Password } from '../../../domain/value-objects/Password';
import { Age } from '../../../domain/value-objects/Age';
import { injectable, inject } from 'inversify';

@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.getId().value },
      update: {
        email: user.getEmail().value,
        first_name: user.getFirstName(),
        last_name: user.getLastName(),
        is_verified: user.getIsVerified(),
        account_status: user.getAccountStatus(),
        updated_at: new Date()
      },
      create: {
        id: user.getId().value,
        email: user.getEmail().value,
        password_hash: user.getHashedPassword(), 
        first_name: user.getFirstName(),
        last_name: user.getLastName(),
        age: user.getAge().value,
        role: user.getRole(),
        is_verified: user.getIsVerified(),
        account_status: user.getAccountStatus()
      }
    });
  }

  async findById(userId: UserId): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId.value }
    });

    if (!userRecord) return null;
    return this.toDomain(userRecord);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: email.value }
    });

    if (!userRecord) return null;
    return this.toDomain(userRecord);
  }

  async findByEmailAndStatus(email: Email, status: string): Promise<User | null> {
    const userRecord = await this.prisma.user.findFirst({
      where: { 
        email: email.value,
        account_status: status
      }
    });

    if (!userRecord) return null;
    return this.toDomain(userRecord);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value }
    });
    return count > 0;
  }

  async updateLastLogin(userId: UserId): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId.value },
      data: { 
        last_login_at: new Date(),
        login_count: { increment: 1 }
      }
    });
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async findActiveUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { account_status: 'active' },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    });

    return users.map(userRecord => this.toDomain(userRecord));
  }

  async findByRole(role: string, limit?: number, offset?: number, status?: string): Promise<User[]> {
    const whereClause: any = { role };
    
    if (status) {
      whereClause.account_status = status;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    });

    return users.map(userRecord => this.toDomain(userRecord));
  }

  async countByRole(role: string, status?: string): Promise<number> {
    const whereClause: any = { role };
    
    if (status) {
      whereClause.account_status = status;
    }

    return this.prisma.user.count({
      where: whereClause
    });
  }

  private toDomain(record: any): User {
    return new User(
      new UserId(record.id),
      new Email(record.email),
      new Password(record.password_hash), 
      new Age(record.age),
      record.first_name,
      record.last_name,
      record.is_verified,
      record.account_status,
      record.created_at,
      record.role
    );
  }
}