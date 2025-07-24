import { Hono } from "hono";
import { auth } from "./lib/auth.ts";

const app = new Hono();

app
  .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
  .get("/", (c) => {
    return c.text("Hello Hono!");
  });

Deno.serve(app.fetch);
