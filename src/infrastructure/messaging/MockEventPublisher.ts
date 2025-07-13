import { EventPublisherPort } from '../../application/ports/ouput/EventPublisherPort';

export class MockEventPublisher implements EventPublisherPort {
  async publish(event: any): Promise<void> {
    // No-op mock
  }
  async publishBatch(events: any[]): Promise<void> {
    // No-op mock
  }
}
