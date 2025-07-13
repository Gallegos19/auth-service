// import amqp, { Connection, Channel } from 'amqplib';
// import { DomainEvent, EventPublisherPort } from '../../application/ports/ouput/EventPublisherPort';

// export class RabbitMQEventPublisher implements EventPublisherPort {
//   private connection: amqp.Connection | null = null;
//   private channel: amqp.Channel | null = null;

//   constructor(private readonly rabbitMQUrl: string) {}

//   async connect(): Promise<void> {
//     this.connection = await amqp.connect(this.rabbitMQUrl);
//     if (!this.connection) throw new Error('Failed to connect to RabbitMQ');
    
//     this.channel = await this.connection.createChannel();
    
//     if (!this.channel) {
//       throw new Error('Failed to create channel for RabbitMQ');
//     }
    
//     await this.channel.assertExchange('domain.events', 'topic', { durable: true });
//   }

//   async publish(event: DomainEvent): Promise<void> {
//     if (!this.channel) {
//       await this.connect();
//     }

//     const message = JSON.stringify({
//       eventType: event.eventType,
//       aggregateId: event.aggregateId,
//       eventData: event.eventData,
//       occurredAt: event.occurredAt.toISOString()
//     });

//     this.channel!.publish('domain.events', event.eventType, Buffer.from(message));
//   }

//   async publishBatch(events: DomainEvent[]): Promise<void> {
//     for (const event of events) {
//       await this.publish(event);
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.channel) {
//       await this.channel.close();
//     }
//     if (this.connection) {
//       await this.connection.close();
//       this.connection = null;
//     }
//   }
// }