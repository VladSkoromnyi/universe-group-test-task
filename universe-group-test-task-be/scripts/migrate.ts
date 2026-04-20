import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Same precedence as AppConfigModule
const nodeEnv = process.env.NODE_ENV ?? 'development';
for (const file of [
  `.env.${nodeEnv}.local`,
  `.env.local`,
  `.env.${nodeEnv}`,
  `.env`,
]) {
  loadEnv({ path: file, override: false });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log(`[migrate] NODE_ENV=${nodeEnv}`);
  console.log(`[migrate] target: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  await migrate(db, { migrationsFolder: './libs/database/migrations' });
  console.log('[migrate] done');

  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
