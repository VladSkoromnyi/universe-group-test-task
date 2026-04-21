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

const WAIT_MAX_ATTEMPTS = 15;
const WAIT_DELAY_MS = 1000;

async function waitForDatabase(pool: Pool): Promise<void> {
  for (let attempt = 1; attempt <= WAIT_MAX_ATTEMPTS; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === WAIT_MAX_ATTEMPTS) {
        throw new Error(
          `Database not reachable after ${WAIT_MAX_ATTEMPTS} attempts: ${msg}`,
        );
      }
      console.log(
        `[migrate] waiting for database (attempt ${attempt}/${WAIT_MAX_ATTEMPTS})...`,
      );
      await new Promise((r) => setTimeout(r, WAIT_DELAY_MS));
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log(`[migrate] NODE_ENV=${nodeEnv}`);
  console.log(`[migrate] target: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);

  const pool = new Pool({ connectionString: databaseUrl });

  await waitForDatabase(pool);

  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: './libs/database/migrations' });
  console.log('[migrate] done');

  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
