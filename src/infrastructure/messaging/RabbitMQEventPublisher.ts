import amqp from 'amqplib';
import { DomainEvent, EventPublisherPort } from '../../application/ports/ouput/EventPublisherPort';

export class RabbitMQEventPublisher implements EventPublisherPort {
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  constructor(private readonly rabbitMQUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitMQUrl);
    this.channel = await this.connection.createChannel();
    
    // Declarar exchange para eventos de dominio
    if (this.channel) {
      await this.channel.assertExchange('domain.events', 'topic', { durable: true });
    } else {
      throw new Error('Failed to create channel for RabbitMQ');
    }
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
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await (this.connection as any).close();
    }
  }
}