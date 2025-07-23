import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';

export interface UpdateDeviceTokenCommand {
  id: string;
  token?: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isActive?: boolean;
}

export interface UpdateDeviceTokenResponse {
  id: string;
  userId: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  updatedAt: Date;
  message: string;
}

@injectable()
export class UpdateDeviceTokenUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(command: UpdateDeviceTokenCommand): Promise<UpdateDeviceTokenResponse> {
    const deviceToken = await this.deviceTokenRepository.findById(command.id);
    
    if (!deviceToken) {
      throw new Error('Device token not found');
    }

    // Check if new token already exists (if token is being updated)
    if (command.token && command.token !== deviceToken.getToken()) {
      const existingToken = await this.deviceTokenRepository.findByToken(command.token);
      if (existingToken) {
        throw new Error('Device token already exists');
      }
      deviceToken.updateToken(command.token);
    }

    // Update app version if provided
    if (command.appVersion !== undefined) {
      deviceToken.updateAppVersion(command.appVersion);
    }

    // Update device info if provided
    if (command.deviceModel !== undefined || command.osVersion !== undefined) {
      deviceToken.updateDeviceInfo(command.deviceModel, command.osVersion);
    }

    // Update active status if provided
    if (command.isActive !== undefined) {
      if (command.isActive) {
        deviceToken.activate();
      } else {
        deviceToken.deactivate();
      }
    }

    await this.deviceTokenRepository.save(deviceToken);

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
      updatedAt: deviceToken.getUpdatedAt(),
      message: 'Device token updated successfully'
    };
  }
}