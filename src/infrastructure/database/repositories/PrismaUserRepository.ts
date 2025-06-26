import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { UserId } from '../../../domain/value-objects/UserId';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: email.value }
    });

    if (!userRecord) return null;

    return this.toDomain(userRecord);
  }

  async findById(userId: UserId): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId.value }
    });

    if (!userRecord) return null;

    return this.toDomain(userRecord);
  }

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

  private toDomain(record: any): User {
    // Convertir record de Prisma a entidad de dominio
    return new User(
      new UserId(record.id),
      new Email(record.email),
      new Password(record.password_hash),
      new Age(record.age),
      record.first_name,
      record.last_name,
      record.is_verified,
      record.account_status,
      record.created_at
    );
  }
}