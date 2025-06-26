import { EventPublisherPort, DomainEvent } from '../../application/ports/output/EventPublisherPort';
import amqp from 'amqplib';

export class RabbitMQEventPublisher implements EventPublisherPort {
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  constructor(private readonly rabbitMQUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitMQUrl);
    this.channel = await this.connection.createChannel();
    
    // Declarar exchange para eventos de dominio
    await this.channel.assertExchange('domain.events', 'topic', { durable: true });
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const message = JSON.stringify({
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      eventData: event.eventData,
      occurredAt: event.occurredAt,
      publishedAt: new Date()
    });

    const routingKey = `auth.${event.eventType.toLowerCase()}`;
    
    this.channel!.publish(
      'domain.events',
      routingKey,
      Buffer.from(message),
      { persistent: true }
    );
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}