import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ProductsModule } from './products.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PRODUCTS_PORT ?? 3001;
  await app.listen(port);
  console.log(`Products service running on port ${port}`);
}

bootstrap();
