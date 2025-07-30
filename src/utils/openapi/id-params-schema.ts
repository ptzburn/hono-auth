import { z } from "@hono/zod-openapi";

const IdParamsSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "e6abd3e5-fcce-4808-ab86-56844395f5b9",
  }),
});

export default IdParamsSchema;
