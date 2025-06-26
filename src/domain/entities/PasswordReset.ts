import { UserId } from '../value-objects/UserId';
import { Token } from '../value-objects/Token';

export class PasswordReset {
  constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly token: Token,
    private readonly expiresAt: Date,
    private isUsed: boolean = false,
    private usedAt?: Date,
    private readonly createdAt: Date = new Date()
  ) {}

  public static create(userId: UserId, token: string): PasswordReset {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    return new PasswordReset(
      crypto.randomUUID(),
      userId,
      new Token(token),
      expiresAt
    );
  }

  public use(): void {
    if (this.isExpired()) {
      throw new Error('Reset token has expired');
    }
    
    if (this.isUsed) {
      throw new Error('Reset token has already been used');
    }
    
    this.isUsed = true;
    this.usedAt = new Date();
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }

  // Getters
  public getId(): string { return this.id; }
  public getUserId(): UserId { return this.userId; }
  public getToken(): Token { return this.token; }
  public getExpiresAt(): Date { return this.expiresAt; }
  public getIsUsed(): boolean { return this.isUsed; }
  public getUsedAt(): Date | undefined { return this.usedAt; }
  public getCreatedAt(): Date { return this.createdAt; }
}