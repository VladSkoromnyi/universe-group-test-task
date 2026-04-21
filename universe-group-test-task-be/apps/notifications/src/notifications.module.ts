import { Module } from '@nestjs/common';
import { AppConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsHttpController } from './notifications.http.controller';

@Module({
  imports: [AppConfigModule, DatabaseModule],
  controllers: [NotificationsController, NotificationsHttpController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
