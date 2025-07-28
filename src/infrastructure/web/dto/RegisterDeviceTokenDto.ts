import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  token!: string;

  @IsNotEmpty({ message: 'Platform is required' })
  @IsString({ message: 'Platform must be a string' })
  @IsIn(['ios', 'android', 'web'], { message: 'Platform must be ios, android, or web' })
  platform!: string;

  @IsOptional()
  @IsString({ message: 'App version must be a string' }) 
  appVersion?: string;

  @IsOptional()
  @IsString({ message: 'Device model must be a string' })
  deviceModel?: string;

  @IsOptional()
  @IsString({ message: 'OS version must be a string' })
  osVersion?: string;

}