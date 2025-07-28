import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { posts, todos } from "./db/schema.ts";
import { auth } from "./lib/auth.ts";

export type Todo = InferSelectModel<typeof todos>;
export type NewTodo = InferInsertModel<typeof todos>;

export type NewPost = InferInsertModel<typeof posts>;

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};
