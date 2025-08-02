import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import faviconMiddleware from "../middlewares/favicon.middleware.ts";
import { auth } from "./auth.ts";
import notFound from "../middlewares/notFound.middleware.ts";
import onError from "../middlewares/onError.middleware.ts";
import defaultHook from "../utils/openapi/default-hook.ts";
import env from "../env.ts";

export function createRouter() {
  return new OpenAPIHono({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  if (env.ENV !== "test") {
    app.use(logger());
  }

  app
    .use(poweredBy())
    .use(
      "/api/auth/*",
      cors({
        origin: "http://localhost:8000", // for frontend later
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
      }),
    )
    .use(faviconMiddleware("🖥️"))
    .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
    .notFound(notFound)
    .onError(onError);

  return app;
}
