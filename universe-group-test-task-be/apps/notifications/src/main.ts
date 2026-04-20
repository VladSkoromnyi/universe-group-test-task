import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

// Load envs with the same precedence as AppConfigModule so we can read
// RABBITMQ_URL *before* constructing the microservice (Joi validation
// still runs inside the module when it instantiates).
const nodeEnv = process.env.NODE_ENV ?? 'development';
for (const file of [
  `.env.${nodeEnv}.local`,
  `.env.local`,
  `.env.${nodeEnv}`,
  `.env`,
]) {
  loadEnv({ path: file, override: false });
}

async function bootstrap() {
  const logger = new Logger('NotificationsBootstrap');
  const rabbitmqUrl = process.env.RABBITMQ_URL;
  const queue = process.env.RABBITMQ_QUEUE ?? 'products_queue';

  if (!rabbitmqUrl) {
    throw new Error('RABBITMQ_URL is not set');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue,
        queueOptions: { durable: true },
        noAck: false, // manual ack — we ack/nack in controller
        prefetchCount: 10,
      },
      bufferLogs: true,
    },
  );

  await app.listen();
  logger.log(`Notifications microservice listening on queue "${queue}"`);
}

void bootstrap();
