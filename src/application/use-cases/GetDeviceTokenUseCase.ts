import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface GetDeviceTokenCommand {
  id: string;
}

export interface GetDeviceTokenResponse {
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
  updatedAt: Date;
}

@injectable()
export class GetDeviceTokenUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(command: GetDeviceTokenCommand): Promise<GetDeviceTokenResponse> {
    const deviceToken = await this.deviceTokenRepository.findById(command.id);
    
    if (!deviceToken) {
      throw new Error('Device token not found');
    }

    return {
      id: deviceToken.getId(),
      userId: deviceToken.getUserId().value,
      token: deviceToken.getToken(),
      platform: deviceToken.getPlatform(),
      appVersion: deviceToken.getAppVersion(),
      deviceModel: deviceToken.getDeviceModel(),
      osVersion: deviceToken.getOsVersion(),
      isActive: deviceToken.getIsActive(),
      lastUsedAt: deviceToken.getLastUsedAt(),
      createdAt: deviceToken.getCreatedAt(),
      updatedAt: deviceToken.getUpdatedAt()
    };
  }
}