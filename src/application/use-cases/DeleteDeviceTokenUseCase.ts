import { inject, injectable } from 'inversify';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';

export interface DeleteDeviceTokenCommand {
  id: string;
}

export interface DeleteDeviceTokenResponse {
  id: string;
  message: string;
}

@injectable()
export class DeleteDeviceTokenUseCase {
  constructor(
    @inject('IDeviceTokenRepository') private readonly deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(command: DeleteDeviceTokenCommand): Promise<DeleteDeviceTokenResponse> {
    const deviceToken = await this.deviceTokenRepository.findById(command.id);
    
    if (!deviceToken) {
      throw new Error('Device token not found');
    }

    await this.deviceTokenRepository.deleteById(command.id);

    return {
      id: command.id,
      message: 'Device token deleted successfully'
    };
  }
}