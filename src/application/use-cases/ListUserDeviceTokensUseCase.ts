import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface ListUserDeviceTokensCommand {
  userId: string;
  activeOnly?: boolean;
}

export interface DeviceTokenSummary {
  id: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
}

export interface ListUserDeviceTokensResponse {
  userId: string;
  deviceTokens: DeviceTokenSummary[];
  totalCount: number;
}

@injectable()
export class ListUserDeviceTokensUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(command: ListUserDeviceTokensCommand): Promise<ListUserDeviceTokensResponse> {
    const userId = new UserId(command.userId);
    
    let deviceTokens;
    if (command.activeOnly) {
      deviceTokens = await this.deviceTokenRepository.findActiveByUserId(userId);
    } else {
      deviceTokens = await this.deviceTokenRepository.findByUserId(userId);
    }

    const totalCount = command.activeOnly 
      ? await this.deviceTokenRepository.countActiveByUserId(userId)
      : deviceTokens.length;

    const deviceTokenSummaries = deviceTokens.map(token => ({
      id: token.getId(),
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
      userId: userId.value,
      deviceTokens: deviceTokenSummaries,
      totalCount
    };
  }
}