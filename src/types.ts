import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { posts } from "./db/schema.ts";
import { auth } from "./lib/auth.ts";

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};
