import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface GetUserDeviceTokensCommand {
  userId: string;
  activeOnly?: boolean;
}

export interface DeviceTokenDto {
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

export interface GetUserDeviceTokensResponse {
  userId: string;
  deviceTokens: DeviceTokenDto[];
  totalCount: number;
}

@injectable()
export class GetUserDeviceTokensUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository,
    @inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(command: GetUserDeviceTokensCommand): Promise<GetUserDeviceTokensResponse> {
    // Validate user exists
    const userId = new UserId(command.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get device tokens
    const deviceTokens = command.activeOnly 
      ? await this.deviceTokenRepository.findActiveByUserId(userId)
      : await this.deviceTokenRepository.findByUserId(userId);

    // Map to DTOs
    const deviceTokenDtos = deviceTokens.map(token => ({
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
      userId: userId.value(),
      deviceTokens: deviceTokenDtos,
      totalCount: deviceTokenDtos.length
    };
  }
}