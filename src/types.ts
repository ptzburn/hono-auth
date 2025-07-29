import type { InferInsertModel } from "drizzle-orm";
import { posts } from "./db/schema.ts";
import { auth } from "./lib/auth.ts";
import type { z } from "@hono/zod-openapi";

export type NewPost = InferInsertModel<typeof posts>;

export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};
