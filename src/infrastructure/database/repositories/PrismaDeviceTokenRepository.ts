import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { DeviceToken } from '../../../domain/entities/DeviceToken';
import { IDeviceTokenRepository } from '../../../domain/repositories/IDeviceTokenRepository';
import { UserId } from '../../../domain/value-objects/UserId';

@injectable()
export class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
  constructor(
    @inject('PrismaClient') private readonly prisma: PrismaClient
  ) {}

  async save(deviceToken: DeviceToken): Promise<void> {
    await this.prisma.deviceToken.upsert({
      where: { id: deviceToken.getId() },
      update: {
        token: deviceToken.getToken(),
        platform: deviceToken.getPlatform(),
        app_version: deviceToken.getAppVersion(),
        device_model: deviceToken.getDeviceModel(),
        os_version: deviceToken.getOsVersion(),
        is_active: deviceToken.getIsActive(),
        last_used_at: deviceToken.getLastUsedAt(),
        updated_at: new Date()
      },
      create: {
        id: deviceToken.getId(),
        user_id: deviceToken.getUserId().value,
        token: deviceToken.getToken(),
        platform: deviceToken.getPlatform(),
        app_version: deviceToken.getAppVersion(),
        device_model: deviceToken.getDeviceModel(),
        os_version: deviceToken.getOsVersion(),
        is_active: deviceToken.getIsActive(),
        last_used_at: deviceToken.getLastUsedAt(),
        created_at: deviceToken.getCreatedAt()
      }
    });
  }

  async findById(id: string): Promise<DeviceToken | null> {
    const record = await this.prisma.deviceToken.findUnique({
      where: { id }
    });

    return record ? this.toDomain(record) : null;
  }

  async findByToken(token: string): Promise<DeviceToken | null> {
    const record = await this.prisma.deviceToken.findUnique({
      where: { token }
    });

    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: UserId): Promise<DeviceToken[]> {
    const records = await this.prisma.deviceToken.findMany({
      where: { user_id: userId.value }
    });

    return records.map(record => this.toDomain(record));
  }

  async findActiveByUserId(userId: UserId): Promise<DeviceToken[]> {
    const records = await this.prisma.deviceToken.findMany({
      where: { 
        user_id: userId.value,
        is_active: true
      }
    });

    return records.map(record => this.toDomain(record));
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.deviceToken.delete({
      where: { id }
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.deviceToken.delete({
      where: { token }
    });
  }

  async deleteAllByUserId(userId: UserId): Promise<number> {
    const result = await this.prisma.deviceToken.deleteMany({
      where: { user_id: userId.value }
    });

    return result.count;
  }

  async countActiveByUserId(userId: UserId): Promise<number> {
    return await this.prisma.deviceToken.count({
      where: {
        user_id: userId.value,
        is_active: true
      }
    });
  }

  private toDomain(record: any): DeviceToken {
    const deviceToken = Object.create(DeviceToken.prototype);
    
    // Use reflection to set private properties
    Object.defineProperties(deviceToken, {
      id: { value: record.id, writable: true },
      userId: { value: new UserId(record.user_id), writable: true },
      token: { value: record.token, writable: true },
      platform: { value: record.platform, writable: true },
      appVersion: { value: record.app_version, writable: true },
      deviceModel: { value: record.device_model, writable: true },
      osVersion: { value: record.os_version, writable: true },
      isActive: { value: record.is_active, writable: true },
      lastUsedAt: { value: record.last_used_at, writable: true },
      createdAt: { value: record.created_at, writable: true },
      updatedAt: { value: record.updated_at, writable: true }
    });

    return deviceToken;
  }
}