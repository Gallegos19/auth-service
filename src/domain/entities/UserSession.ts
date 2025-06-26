import { UserId } from '../value-objects/UserId';
import { Token } from '../value-objects/Token';

export class UserSession {
  constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly accessToken: Token,
    private readonly refreshToken: Token,
    private readonly deviceInfo: any,
    private readonly ipAddress: string,
    private readonly expiresAt: Date,
    private isActive: boolean = true,
    private readonly createdAt: Date = new Date()
  ) {}

  public static create(
    userId: UserId,
    accessToken: Token,
    refreshToken: Token,
    deviceInfo: any,
    ipAddress: string,
    expiresAt: Date
  ): UserSession {
    return new UserSession(
      crypto.randomUUID(),
      userId,
      accessToken,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt
    );
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public invalidate(): void {
    this.isActive = false;
  }

  public isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  // Getters
  public getId(): string { return this.id; }
  public getUserId(): UserId { return this.userId; }
  public getAccessToken(): Token { return this.accessToken; }
  public getRefreshToken(): Token { return this.refreshToken; }
  public getExpiresAt(): Date { return this.expiresAt; }
  public getIsActive(): boolean { return this.isActive; }
}