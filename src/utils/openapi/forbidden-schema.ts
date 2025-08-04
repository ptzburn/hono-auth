import { z } from "@hono/zod-openapi";

const forbiddenErrorSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  message: z.string().openapi({
    example: "Forbidden",
  }),
}).openapi({
  description: "Error response for 403 Forbidden",
});

export default forbiddenErrorSchema;
