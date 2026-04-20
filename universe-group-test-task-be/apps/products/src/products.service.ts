import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { eq, desc, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { firstValueFrom } from 'rxjs';
import { DRIZZLE } from '../../../libs/database/src/database.module';
import { products } from '../../../libs/database/src/schema';
import { RABBITMQ_CLIENT, PRODUCT_EVENTS } from '../../../libs/rabbitmq/src';
import { CreateProductDto, PaginationDto } from './dto/product.dto';
import * as schema from '../../../libs/database/src/schema';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(RABBITMQ_CLIENT) private readonly rmqClient: ClientProxy,
  ) {}

  async create(dto: CreateProductDto) {
    const [product] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description,
        price: dto.price.toString(),
      })
      .returning();

    await firstValueFrom(
      this.rmqClient.emit(PRODUCT_EVENTS.CREATED, {
        event: PRODUCT_EVENTS.CREATED,
        payload: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          timestamp: new Date().toISOString(),
        },
      }),
    );

    return product;
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await firstValueFrom(
      this.rmqClient.emit(PRODUCT_EVENTS.DELETED, {
        event: PRODUCT_EVENTS.DELETED,
        payload: {
          id: deleted.id,
          timestamp: new Date().toISOString(),
        },
      }),
    );

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
}
