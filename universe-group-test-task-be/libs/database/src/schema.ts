import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }).notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    createdAtIdx: index('products_created_at_idx').on(t.createdAt.desc()),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

/**
 * Events consumed by the notifications service — one row per RMQ message.
 * `payload` keeps the raw event body so we can render whatever fields the
 * event carried without a migration every time the event shape drifts.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    productId: uuid('product_id'),
    payload: jsonb('payload').notNull(),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
  },
  (t) => ({
    receivedAtIdx: index('notifications_received_at_idx').on(
      t.receivedAt.desc(),
    ),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
