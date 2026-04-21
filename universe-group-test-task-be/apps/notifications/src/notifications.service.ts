import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { desc, eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE, notifications, type Notification } from '@libs/database';
import * as schema from '@libs/database/schema';
import { PRODUCT_EVENTS, type ProductEvent } from '@libs/rabbitmq';
import { PaginationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Handle an incoming RMQ event: persist it so the HTTP API can list it
   * later, then emit a human-readable log line. Persistence first — the log
   * is purely observability, the row is the product of record.
   */
  async handleProductEvent(data: ProductEvent): Promise<void> {
    await this.db.insert(notifications).values({
      eventType: data.event,
      productId: data.payload?.id ?? null,
      payload: data.payload,
    });

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
        this.logger.warn(`Unknown event received: ${JSON.stringify(data)}`);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.receivedAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(notifications),
    ]);

    return {
      data: items,
      meta: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async remove(id: string): Promise<Notification> {
    const [deleted] = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return deleted;
  }
}
