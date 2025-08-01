import { createRouter } from "../lib/create-app.ts";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import jsonContent from "../utils/openapi/json-content.ts";

const router = createRouter()
  .openapi(
    createRoute({
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
