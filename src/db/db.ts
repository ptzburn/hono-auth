import "jsr:@std/dotenv/load";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

export const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL")!,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema, casing: "snake_case" });
