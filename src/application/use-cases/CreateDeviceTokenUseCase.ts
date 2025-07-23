import { inject, injectable } from 'inversify';
import { DeviceToken } from '../../domain/entities/DeviceToken';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface CreateDeviceTokenCommand {
  userId: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
}

export interface CreateDeviceTokenResponse {
  id: string;
  userId: string;
  token: string;
  platform: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isActive: boolean;
  createdAt: Date;
  message: string;
}

@injectable()
export class CreateDeviceTokenUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository,
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: CreateDeviceTokenCommand): Promise<CreateDeviceTokenResponse> {
    // Validate user exists
    const userId = new UserId(command.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if token already exists
    const existingToken = await this.deviceTokenRepository.findByToken(command.token);
    if (existingToken) {
      throw new Error('Device token already exists');
    }

    // Validate platform
    const validPlatforms = ['ios', 'android', 'web'];
    if (!validPlatforms.includes(command.platform.toLowerCase())) {
      throw new Error('Invalid platform. Must be one of: ios, android, web');
    }

    // Create device token
    const deviceToken = DeviceToken.create(
      userId,
      command.token,
      command.platform.toLowerCase(),
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
      appVersion: deviceToken.getAppVersion(),
      deviceModel: deviceToken.getDeviceModel(),
      osVersion: deviceToken.getOsVersion(),
      isActive: deviceToken.getIsActive(),
      createdAt: deviceToken.getCreatedAt(),
      message: 'Device token created successfully'
    };
  }
}