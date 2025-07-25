import { Hono } from "hono";
import { auth } from "./lib/auth.ts";
import { todos } from "./routes/todos.routes.ts";
import { cors } from "hono/cors";

const app = new Hono();

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
  .get("/", (c) => {
    return c.text("Hello Hono!");
  });

Deno.serve(app.fetch);
