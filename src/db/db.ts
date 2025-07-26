import "jsr:@std/dotenv/load";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.ts";

export const sql = neon(Deno.env.get("DATABASE_URL")!);

export const db = drizzle({ client: sql, schema, casing: "snake_case" });
