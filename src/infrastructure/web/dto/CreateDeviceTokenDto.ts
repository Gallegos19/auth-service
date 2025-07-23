import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ios', 'android', 'web'])
  platform!: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;
}