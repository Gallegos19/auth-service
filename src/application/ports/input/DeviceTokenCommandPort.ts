import { RegisterDeviceTokenCommand, RegisterDeviceTokenResponse } from '../../use-cases/RegisterDeviceTokenUseCase';
import { UpdateDeviceTokenCommand, UpdateDeviceTokenResponse } from '../../use-cases/UpdateDeviceTokenUseCase';
import { DeleteDeviceTokenCommand, DeleteDeviceTokenResponse } from '../../use-cases/DeleteDeviceTokenUseCase';

export interface DeviceTokenCommandPort {
  registerDeviceToken(command: RegisterDeviceTokenCommand): Promise<RegisterDeviceTokenResponse>;
  updateDeviceToken(command: UpdateDeviceTokenCommand): Promise<UpdateDeviceTokenResponse>;
  deleteDeviceToken(command: DeleteDeviceTokenCommand): Promise<DeleteDeviceTokenResponse>;
}