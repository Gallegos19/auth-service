import { inject, injectable } from 'inversify';
import { DeviceToken } from '../../domain/entities/DeviceToken';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface RegisterDeviceTokenCommand {
  userId: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
}

export interface RegisterDeviceTokenResponse {
  id: string;
  userId: string;
  token: string;
  platform: string;
  isActive: boolean;
  message: string;
}

@injectable()
export class RegisterDeviceTokenUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository,
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: RegisterDeviceTokenCommand): Promise<RegisterDeviceTokenResponse> {
    // Validate user exists
    const userId = new UserId(command.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if token already exists
    const existingToken = await this.deviceTokenRepository.findByToken(command.token);
    if (existingToken) {
      // If token exists but belongs to another user, delete it
      if (!existingToken.getUserId().equals(userId)) {
        await this.deviceTokenRepository.deleteByToken(command.token);
      } else {
        // Update the existing token
        existingToken.updateLastUsed();
        existingToken.updateDeviceInfo(command.deviceModel, command.osVersion);
        if (command.appVersion) {
          existingToken.updateAppVersion(command.appVersion);
        }
        existingToken.activate();
        await this.deviceTokenRepository.save(existingToken);

        return {
          id: existingToken.getId(),
          userId: existingToken.getUserId().value,
          token: existingToken.getToken(),
          platform: existingToken.getPlatform(),
          isActive: existingToken.getIsActive(),
          message: 'Device token updated successfully'
        };
      }
    }

    // Create new device token
    const deviceToken = DeviceToken.create(
      userId,
      command.token,
      command.platform,
      command.appVersion,
      command.deviceModel,
      command.osVersion
    );

    await this.deviceTokenRepository.save(deviceToken);

    return {
      id: deviceToken.getId(),
      userId: deviceToken.getUserId().value,
      token: deviceToken.getToken(),
      platform: deviceToken.getPlatform(),
      isActive: deviceToken.getIsActive(),
      message: 'Device token registered successfully'
    };
  }
}