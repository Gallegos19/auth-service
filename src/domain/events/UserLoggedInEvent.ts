import { DomainEvent } from "../../application/ports/ouput/EventPublisherPort";

export class UserLoggedInEvent implements DomainEvent {
  public readonly eventType = 'USER_LOGGED_IN';

  constructor(
    public readonly aggregateId: string, // userId
    public readonly email: string,
    public readonly ipAddress: string,
    public readonly deviceInfo: any,
    public readonly occurredAt: Date
  ) {}

  public get eventData() {
    return {
      userId: this.aggregateId,
      email: this.email,
      ipAddress: this.ipAddress,
      deviceInfo: this.deviceInfo
    };
  }
}