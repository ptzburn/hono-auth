import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.ts";
import { HonoEnv } from "../types.ts";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});
