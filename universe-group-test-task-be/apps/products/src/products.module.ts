import { Module } from '@nestjs/common';
import { AppConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { RabbitmqModule } from '@libs/rabbitmq';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AppConfigModule, DatabaseModule, RabbitmqModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
