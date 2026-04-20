import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../../../libs/database/src';
import { RabbitmqModule } from '../../../libs/rabbitmq/src';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    RabbitmqModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
