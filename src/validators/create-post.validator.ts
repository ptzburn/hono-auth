import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(3, "Content is required"),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
}).strict();

export const createPostValidator = zValidator(
  "json",
  createPostSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      }, 400);
    }
  },
);
