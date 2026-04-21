import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationsHttpController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.notifications.findAll(pagination);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.remove(id);
  }
}
