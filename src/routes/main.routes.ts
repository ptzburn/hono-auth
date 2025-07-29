import { createRouter } from "../lib/create-app.ts";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

const router = createRouter()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean().default(true),
                message: z.string(),
              }),
            },
          },
          description: "Blog API Main",
        },
      },
    }),
    (c) => {
      return c.json({
        success: true,
        message: "Blog API",
      });
    },
  );

export default router;
