import type { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

export default function configureOpenApi(app: OpenAPIHono) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Blog API",
    },
  });

  app.get(
    "/reference",
    Scalar({
      pageTitle: "Blog API Documentation",
      theme: "deepSpace",
      layout: "classic",
      defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      sources: [
        { url: "/doc", title: "API" },
        { url: "/api/auth/open-api/generate-schema", title: "Authentication" },
      ],
    }),
  );
}
