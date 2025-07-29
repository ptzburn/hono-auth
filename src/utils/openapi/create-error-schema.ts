import { z } from "@hono/zod-openapi";
import type { ZodSchema } from "../../types.ts";

const createErrorSchema = <
  T extends ZodSchema,
>(schema: T) => {
  const { error } = schema.safeParse(
    schema instanceof z.ZodArray ? [] : {},
  );
  return z.object({
    success: z.boolean().openapi({
      example: false,
    }),
    errors: z.array(
      z.record(
        z.string(),
        z.string(),
      ),
    ).openapi({
      example: error
        ? error.issues.map((issue) => ({
          [issue.path.join(".")]: issue.message,
        }))
        : [],
    }),
  });
};

export default createErrorSchema;
