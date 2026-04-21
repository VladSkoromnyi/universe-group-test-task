import { Injectable, Logger } from '@nestjs/common';
import { PRODUCT_EVENTS, type ProductEvent } from '@libs/rabbitmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async handleProductEvent(data: ProductEvent): Promise<void> {
    switch (data.event) {
      case PRODUCT_EVENTS.CREATED:
        this.logger.log(
          `📦 Product CREATED: id=${data.payload.id} name="${data.payload.name}" price=${data.payload.price} at ${data.payload.timestamp}`,
        );
        break;

      case PRODUCT_EVENTS.DELETED:
        this.logger.log(
          `🗑  Product DELETED: id=${data.payload.id} at ${data.payload.timestamp}`,
        );
        break;

      default:
        this.logger.warn(
          `Unknown event received: ${JSON.stringify(data)}`,
        );
    }
  }
}
