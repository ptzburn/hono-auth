import { z } from "@hono/zod-openapi";

const TagParamsSchema = z.object({
  tagName: z.string().openapi({
    param: {
      name: "tagName",
      in: "path",
    },
    example: "hono",
  }),
});

export default TagParamsSchema;
