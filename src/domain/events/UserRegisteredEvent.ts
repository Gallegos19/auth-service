import { DomainEvent } from '../../application/ports/output/EventPublisherPort';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventType = 'USER_REGISTERED';

  constructor(
    public readonly aggregateId: string, // userId
    public readonly email: string,
    public readonly age: number,
    public readonly role: string,
    public readonly needsParentalConsent: boolean,
    public readonly occurredAt: Date
  ) {}

  public get eventData() {
    return {
      userId: this.aggregateId,
      email: this.email,
      age: this.age,
      role: this.role,
      needsParentalConsent: this.needsParentalConsent
    };
  }
}