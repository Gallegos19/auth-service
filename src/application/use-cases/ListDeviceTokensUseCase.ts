import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface ListDeviceTokensCommand {
  userId?: string;
  activeOnly?: boolean;
}

export interface DeviceTokenSummary {
  id: string;
  userId: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
}

export interface ListDeviceTokensResponse {
  deviceTokens: DeviceTokenSummary[];
  total: number;
  message: string;
}

@injectable()
export class ListDeviceTokensUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(command: ListDeviceTokensCommand): Promise<ListDeviceTokensResponse> {
    let deviceTokens;

    if (command.userId) {
      const userId = new UserId(command.userId);
      
      if (command.activeOnly) {
        deviceTokens = await this.deviceTokenRepository.findActiveByUserId(userId);
      } else {
        deviceTokens = await this.deviceTokenRepository.findByUserId(userId);
      }
    } else {
      throw new Error('userId is required for listing device tokens');
    }

    const deviceTokenSummaries: DeviceTokenSummary[] = deviceTokens.map(token => ({
      id: token.getId(),
      userId: token.getUserId().value,
      token: token.getToken(),
      platform: token.getPlatform(),
      appVersion: token.getAppVersion(),
      deviceModel: token.getDeviceModel(),
      osVersion: token.getOsVersion(),
      isActive: token.getIsActive(),
      lastUsedAt: token.getLastUsedAt(),
      createdAt: token.getCreatedAt()
    }));

    return {
      deviceTokens: deviceTokenSummaries,
      total: deviceTokenSummaries.length,
      message: 'Device tokens retrieved successfully'
    };
  }
}