import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { UserId } from '../value-objects/UserId';
import { Age } from '../value-objects/Age';
import { UserRegisteredEvent } from '../events/UserRegisteredEvent';

export type UserRole = 'user' | 'user_minor';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deactivated';

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private hashedPassword: Password,
    private readonly age: Age,
    private firstName?: string,
    private lastName?: string,
    private isVerified: boolean = false,
    private accountStatus: AccountStatus = 'pending_verification',
    private readonly createdAt: Date = new Date()
  ) {}

  public static create(
    email: Email,
    password: Password,
    age: Age,
    firstName?: string,
    lastName?: string
  ): { user: User; event: UserRegisteredEvent } {
    const userId = UserId.generate();
    const user = new User(userId, email, password, age, firstName, lastName);

    const event = new UserRegisteredEvent(
      userId.value,
      email.value,
      age.value,
      user.getRole(),
      user.needsParentalConsent(),
      new Date()
    );

    return { user, event };
  }

  public verifyEmail(): void {
    this.isVerified = true;
    this.accountStatus = 'active';
  }

  public activate(): void {
    if (!this.isVerified) {
      throw new Error('User must be verified before activation');
    }
    this.accountStatus = 'active';
  }

  public suspend(): void {
    this.accountStatus = 'suspended';
  }

  public validatePassword(plainPassword: string, passwordService: any): boolean {
    return passwordService.compare(plainPassword, this.hashedPassword.value);
  }

  public getRole(): UserRole {
    return this.age.isMinor() ? 'user_minor' : 'user';
  }

  public needsParentalConsent(): boolean {
    return this.age.requiresParentalConsent();
  }

  public canLogin(): boolean {
    return this.isVerified && this.accountStatus === 'active';
  }

  // Getters
  public getId(): UserId { return this.id; }
  public getEmail(): Email { return this.email; }
  public getAge(): Age { return this.age; }
  public getFirstName(): string | undefined { return this.firstName; }
  public getLastName(): string | undefined { return this.lastName; }
  public getIsVerified(): boolean { return this.isVerified; }
  public getAccountStatus(): AccountStatus { return this.accountStatus; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getPasswordHash(): Password { return this.hashedPassword; }
  public setPasswordHash(password: Password): void {
    this.hashedPassword = password;
  }
}