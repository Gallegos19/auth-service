import { UserId } from '../value-objects/UserId';

export class DeviceToken {
  private constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly token: string,
    private readonly platform: string,
    private appVersion?: string,
    private deviceModel?: string,
    private osVersion?: string,
    private isActive: boolean = true,
    private lastUsedAt: Date = new Date(),
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  public static create(
    userId: UserId,
    token: string,
    platform: string,
    appVersion?: string,
    deviceModel?: string,
    osVersion?: string
  ): DeviceToken {
    return new DeviceToken(
      crypto.randomUUID(),
      userId,
      token,
      platform,
      appVersion,
      deviceModel,
      osVersion
    );
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getToken(): string {
    return this.token;
  }

  public getPlatform(): string {
    return this.platform;
  }

  public getAppVersion(): string | undefined {
    return this.appVersion;
  }

  public getDeviceModel(): string | undefined {
    return this.deviceModel;
  }

  public getOsVersion(): string | undefined {
    return this.osVersion;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getLastUsedAt(): Date {
    return this.lastUsedAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Methods
  public updateToken(token: string): void {
    this.updatedAt = new Date();
    this.lastUsedAt = new Date();
  }

  public updateAppVersion(appVersion: string): void {
    this.appVersion = appVersion;
    this.updatedAt = new Date();
  }

  public updateDeviceInfo(deviceModel?: string, osVersion?: string): void {
    if (deviceModel) this.deviceModel = deviceModel;
    if (osVersion) this.osVersion = osVersion;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }

  public updateLastUsed(): void {
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }
}