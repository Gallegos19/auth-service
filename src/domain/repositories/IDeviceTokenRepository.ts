import { DeviceToken } from '../entities/DeviceToken';
import { UserId } from '../value-objects/UserId';

export interface IDeviceTokenRepository {
  save(deviceToken: DeviceToken): Promise<void>;
  findById(id: string): Promise<DeviceToken | null>;
  findByToken(token: string): Promise<DeviceToken | null>;
  findByUserId(userId: UserId): Promise<DeviceToken[]>;
  findActiveByUserId(userId: UserId): Promise<DeviceToken[]>;
  deleteById(id: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<number>;
  countActiveByUserId(userId: UserId): Promise<number>;
}