import { GetUserDeviceTokensCommand, GetUserDeviceTokensResponse } from '../../use-cases/GetUserDeviceTokensUseCase';

export interface DeviceTokenQueryPort {
  getUserDeviceTokens(command: GetUserDeviceTokensCommand): Promise<GetUserDeviceTokensResponse>;
}