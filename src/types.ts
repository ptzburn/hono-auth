import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { comments, posts } from "./db/schema.ts";
import { auth } from "./lib/auth.ts";
import type { z } from "@hono/zod-openapi";

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type PostUpdate = Partial<NewPost>;

export type NewComment = InferInsertModel<typeof comments>;

export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};
