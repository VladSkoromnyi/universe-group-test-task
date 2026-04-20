import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PRODUCT_EVENTS, type ProductEvent } from '@libs/rabbitmq';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notifications: NotificationsService) {}

  @EventPattern(PRODUCT_EVENTS.CREATED)
  async onProductCreated(
    @Payload() data: ProductEvent,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    await this.handle(PRODUCT_EVENTS.CREATED, data, ctx);
  }

  @EventPattern(PRODUCT_EVENTS.DELETED)
  async onProductDeleted(
    @Payload() data: ProductEvent,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    await this.handle(PRODUCT_EVENTS.DELETED, data, ctx);
  }

  private async handle(
    eventName: string,
    data: ProductEvent,
    ctx: RmqContext,
  ): Promise<void> {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();
    try {
      await this.notifications.handleProductEvent(data);
      channel.ack(message);
    } catch (err) {
      this.logger.error(
        `Failed to process ${eventName} for id=${data?.payload?.id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      // requeue=false — bad message goes to DLQ/discard instead of looping forever
      channel.nack(message, false, false);
    }
  }
}
