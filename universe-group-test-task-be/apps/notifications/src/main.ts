import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
        queue: 'products_queue',
        queueOptions: { durable: true },
        noAck: false,
      },
    },
  );

  await app.listen();
  console.log('Notifications microservice is listening for messages...');
}

bootstrap();
