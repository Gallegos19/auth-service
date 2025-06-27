import { DomainEvent } from "../../application/ports/ouput/EventPublisherPort";

export class ParentalConsentApprovedEvent implements DomainEvent {
  public readonly eventType = 'PARENTAL_CONSENT_APPROVED';

  constructor(
    public readonly aggregateId: string, // userId
    public readonly parentEmail: string,
    public readonly consentToken: string,
    public readonly occurredAt: Date
  ) {}

  public get eventData() {
    return {
      minorUserId: this.aggregateId,
      parentEmail: this.parentEmail,
      consentToken: this.consentToken,
      approvedAt: this.occurredAt
    };
  }
}