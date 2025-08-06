import { createRouter } from "../lib/create-app.ts";
import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "../utils/openapi/json-content.ts";

const router = createRouter()
  .openapi(
    createRoute({
      summary: "returns OK if the server is up and running",
      description: "Check the state of the server",
      tags: ["Main"],
      method: "get",
      path: "/health",
      responses: {
        200: jsonContent(
          z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          "Health Check",
        ),
      },
    }),
    (c) => {
      return c.json({
        success: true,
        message: "OK",
      });
    },
  );

export default router;
