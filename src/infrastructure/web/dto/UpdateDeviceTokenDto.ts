import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDeviceTokenDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}