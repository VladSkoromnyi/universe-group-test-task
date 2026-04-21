import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

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

  // Hybrid app: HTTP server + RMQ microservice in one process.
  // HTTP exposes /notifications (list + delete); RMQ consumes product events
  // and persists them to the same DB the HTTP layer reads from.
  const app = await NestFactory.create(NotificationsModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue,
      queueOptions: { durable: true },
      noAck: false, // manual ack — we ack/nack in controller
      prefetchCount: 10,
    },
  });

  await app.startAllMicroservices();

  const config = app.get(ConfigService);
  const port = config.get<number>('NOTIFICATIONS_PORT') ?? 3002;
  await app.listen(port);

  logger.log(`Notifications HTTP running on http://localhost:${port}`);
  logger.log(`Notifications RMQ listening on queue "${queue}"`);
}

void bootstrap();
