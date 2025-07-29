import { Hono } from "hono";
import { auth } from "./lib/auth.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { posts } from "./routes/posts.routes.ts";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.use(poweredBy());
app.use(logger());
app.use(
  "/api/auth/*",
  cors({
    origin: "http://localhost:8000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app
  .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
  .route("/api/posts", posts)
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      console.error("HTTPException: ", error);
      return c.json({ success: false, error: error.message }, error.status);
    }

    if (error instanceof Error) {
      console.error("Error: ", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: false, error: "An unknown error occurred" }, 500);
  });

Deno.serve(app.fetch);
