// src/domain/entities/EmailVerification.ts
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Token } from '../value-objects/Token';

export class EmailVerification {
  constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly email: Email,
    private readonly verificationToken: Token,
    private readonly expiresAt: Date,
    private isUsed: boolean = false,
    private usedAt?: Date,
    private readonly createdAt: Date = new Date()
  ) {}

  public static create(userId: UserId, email: Email, token: string): EmailVerification {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    return new EmailVerification(
      crypto.randomUUID(),
      userId,
      email,
      new Token(token),
      expiresAt
    );
  }

  public verify(): void {
    if (this.isExpired()) {
      throw new Error('Verification token has expired');
    }
    
    if (this.isUsed) {
      throw new Error('Verification token has already been used');
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
  public getEmail(): Email { return this.email; }
  public getVerificationToken(): Token { return this.verificationToken; }
  public getExpiresAt(): Date { return this.expiresAt; }
  public getIsUsed(): boolean { return this.isUsed; }
  public getUsedAt(): Date | undefined { return this.usedAt; }
  public getCreatedAt(): Date { return this.createdAt; }
}