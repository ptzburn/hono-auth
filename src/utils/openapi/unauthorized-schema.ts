import { z } from "@hono/zod-openapi";

const unauthorizedErrorSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  errors: z.string().openapi({
    example: "Unauthorized",
  }),
}).openapi({
  description: "Error response for 401 Unauthorized",
});

export default unauthorizedErrorSchema;
