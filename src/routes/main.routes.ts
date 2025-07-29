import { createRouter } from "../lib/create-app.ts";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import jsonContent from "../utils/openapi/json-content.ts";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Main"],
      method: "get",
      path: "/",
      responses: {
        200: jsonContent(
          z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          "Blog API Main",
        ),
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
