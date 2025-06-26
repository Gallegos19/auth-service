export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  eventData: any;
  occurredAt: Date;
}

export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}