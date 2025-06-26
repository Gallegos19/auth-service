import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Token } from '../value-objects/Token';

export type ParentalRelationship = 'father' | 'mother' | 'guardian';

export class ParentalConsent {
  constructor(
    private readonly id: string,
    private readonly minorUserId: UserId,
    private readonly parentEmail: Email,
    private readonly parentName: string,
    private readonly relationship: ParentalRelationship,
    private readonly consentToken: Token,
    private isApproved: boolean = false,
    private approvedAt?: Date,
    private readonly expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    private readonly createdAt: Date = new Date()
  ) {}

  public static create(
    minorUserId: UserId,
    parentEmail: Email,
    parentName: string,
    relationship: ParentalRelationship
  ): ParentalConsent {
    const consentToken = new Token(crypto.randomUUID());
    
    return new ParentalConsent(
      crypto.randomUUID(),
      minorUserId,
      parentEmail,
      parentName,
      relationship,
      consentToken
    );
  }

  public approve(): void {
    if (this.isExpired()) {
      throw new Error('Consent token has expired');
    }
    
    this.isApproved = true;
    this.approvedAt = new Date();
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return this.isApproved && !this.isExpired();
  }

  // Getters
  public getId(): string { return this.id; }
  public getMinorUserId(): UserId { return this.minorUserId; }
  public getParentEmail(): Email { return this.parentEmail; }
  public getParentName(): string { return this.parentName; }
  public getRelationship(): ParentalRelationship { return this.relationship; }
  public getConsentToken(): string { return this.consentToken.value; }
  public getIsApproved(): boolean { return this.isApproved; }
  public getApprovedAt(): Date | undefined { return this.approvedAt; }
  public getExpiresAt(): Date { return this.expiresAt; }
  public getCreatedAt(): Date { return this.createdAt; }
}