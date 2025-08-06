import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "../../utils/openapi/json-content.ts";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import unauthorizedErrorSchema from "../../utils/openapi/unauthorized-schema.ts";
import IdParamsSchema from "../../utils/openapi/id-params-schema.ts";
import createErrorSchema from "../../utils/openapi/create-error-schema.ts";

export const getForPosts = createRoute({
  summary: "returns the likes number under the post",
  description: "Get the likes number under the post",
  tags: ["Likes"],
  method: "get",
  path: "/posts/{id}/likes",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: jsonContent(
      z.object({ success: z.boolean(), likes: z.number() }),
      "The number of likes under the post",
    ),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
    422: jsonContent(
      createErrorSchema(z.object()),
      "Invalid id error",
    ),
  },
});

export const createForPosts = createRoute({
  summary: "likes/unlikes the selected post",
  description: "Like or unlike the post",
  tags: ["Likes"],
  method: "post",
  path: "/posts/{id}/like",
  request: {
    params: IdParamsSchema,
  },
  middleware: [authMiddleware] as const,
  responses: {
    201: {
      description: "Liked the post",
    },
    204: {
      description: "Unliked the post",
    },
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
    422: jsonContent(
      createErrorSchema(z.object()),
      "Invalid id error",
    ),
  },
});

export const getForComments = createRoute({
  summary: "returns the likes number under the comment",
  description: "Get the likes number under the comment",
  tags: ["Likes"],
  method: "get",
  path: "/comments/{id}/likes",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: jsonContent(
      z.object({ success: z.boolean(), likes: z.number() }),
      "The number of likes under the comment",
    ),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Comment not found",
    ),
    422: jsonContent(
      createErrorSchema(z.object()),
      "Invalid id error",
    ),
  },
});

export const createForComments = createRoute({
  summary: "likes/unlikes the selected comment",
  description: "Like or unlike the comment",
  tags: ["Likes"],
  method: "post",
  path: "/comments/{id}/like",
  request: {
    params: IdParamsSchema,
  },
  middleware: [authMiddleware] as const,
  responses: {
    201: {
      description: "Liked the comment",
    },
    204: {
      description: "Unliked the comment",
    },
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Comment not found",
    ),
    422: jsonContent(
      createErrorSchema(z.object()),
      "Invalid id error",
    ),
  },
});

export type GetPostRoute = typeof getForPosts;
export type CreatePostRoute = typeof createForPosts;

export type GetCommentRoute = typeof getForComments;
export type CreateCommentRoute = typeof createForComments;
