/*import "jsr:@std/dotenv/load";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.ts";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dirname, fromFileUrl, join } from "jsr:@std/path";

export type TestDbContext = {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  testDbName: string;
};

const adminDbUrl = Deno.env.get("ADMIN_DB_URL")!;

export async function createTestDb(): Promise<TestDbContext> {
  const testDbName = `test_db_${crypto.randomUUID().replace(/-/g, "")}`;
  const testDbUrl = `postgresql://user:password@localhost:5432/${testDbName}`;

  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(`CREATE DATABASE "${testDbName}"`);
  await adminPool.end();

  const pool = new Pool({
    connectionString: testDbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  const db = drizzle(pool, { schema, casing: "snake_case" });

  const migrationsFolder = fromFileUrl(
    join(dirname(import.meta.url), "../db/drizzle"),
  );
  await migrate(db, { migrationsFolder });

  return { pool, db, testDbName };
}

export async function destroyTestDb({ pool, testDbName }: TestDbContext) {
  await pool.end();

  const adminPool = new Pool({ connectionString: adminDbUrl });

  await adminPool.query(
    `
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
        `,
    [testDbName],
  );
  await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await adminPool.end();
}
