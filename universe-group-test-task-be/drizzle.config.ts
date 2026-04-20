import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './libs/database/src/schema.ts',
  out: './libs/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/products_db',
  },
  strict: true,
  verbose: true,
} satisfies Config;
