import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://ugc:ugc@localhost:5433/ugc_studio';

async function main() {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations complete');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
