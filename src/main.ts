import { Hono } from "hono";
import { auth } from "./lib/auth.ts";
import { todos } from "./routes/todos.routes.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { posts } from "./routes/posts.routes.ts";

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
  .route("/api/todos", todos)
  .route("/api/posts", posts)
  .get("/", (c) => {
    return c.text("Blog API");
  });

Deno.serve(app.fetch);
