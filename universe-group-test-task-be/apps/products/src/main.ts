import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsModule } from './products.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = new Logger('ProductsBootstrap');

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

  const port = config.get<number>('PRODUCTS_PORT') ?? 3001;
  await app.listen(port);
  logger.log(`Products service running on http://localhost:${port}`);
}

void bootstrap();
