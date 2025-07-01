import { DomainEvent } from "../../application/ports/ouput/EventPublisherPort";

export class EmailVerifiedEvent implements DomainEvent {
  public readonly eventType = 'EMAIL_VERIFIED';

  constructor(
    public readonly aggregateId: string, // userId
    public readonly email: string,
    public readonly occurredAt: Date
  ) {}

  public get eventData() {
    return {
      userId: this.aggregateId,
      email: this.email,
      verifiedAt: this.occurredAt
    };
  }
}