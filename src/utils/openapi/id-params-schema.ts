import { z } from "@hono/zod-openapi";

const IdParamsSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: crypto.randomUUID(),
  }),
});

export default IdParamsSchema;
