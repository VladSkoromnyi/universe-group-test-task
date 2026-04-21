import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { eq, desc, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE, products, type Product } from '@libs/database';
import * as schema from '@libs/database/schema';
import {
  RABBITMQ_CLIENT,
  PRODUCT_EVENTS,
  type ProductEvent,
} from '@libs/rabbitmq';
import { CreateProductDto, PaginationDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(RABBITMQ_CLIENT) private readonly rmqClient: ClientProxy,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const [product] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description,
        price: dto.price.toFixed(2),
      })
      .returning();

    this.publish({
      event: PRODUCT_EVENTS.CREATED,
      payload: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        timestamp: new Date().toISOString(),
      },
    });

    return product;
  }

  async remove(id: string): Promise<Product> {
    const [deleted] = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    this.publish({
      event: PRODUCT_EVENTS.DELETED,
      payload: {
        id: deleted.id,
        timestamp: new Date().toISOString(),
      },
    });

    return deleted;
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(products),
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

  /**
   * Fire-and-forget publish. We intentionally do NOT await the broker ack —
   * if RabbitMQ is temporarily unavailable, the HTTP request still succeeds
   * (the DB write is the source of truth). Failures are logged for observability.
   */
  private publish(message: ProductEvent): void {
    this.rmqClient.emit(message.event, message).subscribe({
      error: (err) => {
        this.logger.error(
          `Failed to publish ${message.event} for id=${message.payload.id}: ${err?.message ?? err}`,
        );
      },
    });
  }
}
