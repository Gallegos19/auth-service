import { inject, injectable } from 'inversify';
import { DeviceTokenCommandPort } from '../ports/input/DeviceTokenCommandPort';
import { DeviceTokenQueryPort } from '../ports/input/DeviceTokenQueryPort';
import { RegisterDeviceTokenCommand, RegisterDeviceTokenResponse, RegisterDeviceTokenUseCase } from '../use-cases/RegisterDeviceTokenUseCase';
import { GetUserDeviceTokensCommand, GetUserDeviceTokensResponse, GetUserDeviceTokensUseCase } from '../use-cases/GetUserDeviceTokensUseCase';
import { UpdateDeviceTokenCommand, UpdateDeviceTokenResponse, UpdateDeviceTokenUseCase } from '../use-cases/UpdateDeviceTokenUseCase';
import { DeleteDeviceTokenCommand, DeleteDeviceTokenResponse, DeleteDeviceTokenUseCase } from '../use-cases/DeleteDeviceTokenUseCase';

@injectable()
export class DeviceTokenApplicationService implements DeviceTokenCommandPort, DeviceTokenQueryPort {
  constructor(
    @inject('RegisterDeviceTokenUseCase') private readonly registerDeviceTokenUseCase: RegisterDeviceTokenUseCase,
    @inject('GetUserDeviceTokensUseCase') private readonly getUserDeviceTokensUseCase: GetUserDeviceTokensUseCase,
    @inject('UpdateDeviceTokenUseCase') private readonly updateDeviceTokenUseCase: UpdateDeviceTokenUseCase,
    @inject('DeleteDeviceTokenUseCase') private readonly deleteDeviceTokenUseCase: DeleteDeviceTokenUseCase
  ) {}

  // Command Methods
  async registerDeviceToken(command: RegisterDeviceTokenCommand): Promise<RegisterDeviceTokenResponse> {
    return await this.registerDeviceTokenUseCase.execute(command);
  }

  async updateDeviceToken(command: UpdateDeviceTokenCommand): Promise<UpdateDeviceTokenResponse> {
    return await this.updateDeviceTokenUseCase.execute(command);
  }

  async deleteDeviceToken(command: DeleteDeviceTokenCommand): Promise<DeleteDeviceTokenResponse> {
    return await this.deleteDeviceTokenUseCase.execute(command);
  }

  // Query Methods
  async getUserDeviceTokens(command: GetUserDeviceTokensCommand): Promise<GetUserDeviceTokensResponse> {
    return await this.getUserDeviceTokensUseCase.execute(command);
  }
}