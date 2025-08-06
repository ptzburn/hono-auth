import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "../../utils/openapi/json-content.ts";
import {
  insertPostsSchema,
  selectPostsSchema,
  updatePostsSchema,
} from "../../db/schema.ts";
import jsonContentRequired from "../../utils/openapi/json-content-required.ts";
import createErrorSchema from "../../utils/openapi/create-error-schema.ts";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import unauthorizedErrorSchema from "../../utils/openapi/unauthorized-schema.ts";
import IdParamsSchema from "../../utils/openapi/id-params-schema.ts";
import TagParamsSchema from "../../utils/openapi/tag-params-schema.ts";
import forbiddenErrorSchema from "../../utils/openapi/forbidden-schema.ts";

export const getAllPosts = createRoute({
  summary: "returns an array with the posts",
  description: "Get all posts in an array",
  tags: ["Posts"],
  method: "get",
  path: "/posts",
  responses: {
    200: jsonContent(
      z.array(selectPostsSchema),
      "List of all posts",
    ),
  },
});

export const create = createRoute({
  summary: "publishes the post",
  description: "Publish the post",
  tags: ["Posts"],
  method: "post",
  path: "/posts",
  request: {
    body: jsonContentRequired(insertPostsSchema, "Post to create"),
  },
  middleware: [authMiddleware] as const,
  responses: {
    201: jsonContent(
      selectPostsSchema,
      "Created post",
    ),
    422: jsonContent(
      createErrorSchema(insertPostsSchema),
      "Validation error(s)",
    ),
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
  },
});

export const getOne = createRoute({
  summary: "returns the selected post",
  description: "Get the selected post",
  tags: ["Posts"],
  method: "get",
  path: "/posts/{id}",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: jsonContent(
      selectPostsSchema,
      "Requested post",
    ),
    422: jsonContent(
      createErrorSchema(insertPostsSchema),
      "Invalid id error",
    ),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});

export const getByTag = createRoute({
  summary: "returns an array with posts with the tag",
  description: "Get an array with posts that include the selected tag",
  tags: ["Posts"],
  method: "get",
  path: "/tags/{tagName}",
  request: {
    params: TagParamsSchema,
  },
  responses: {
    200: jsonContent(
      z.array(selectPostsSchema),
      "List of all posts tagged with the selected tag",
    ),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});

export const update = createRoute({
  summary: "edits the selected post",
  description: "Edit the selected post",
  tags: ["Posts"],
  method: "patch",
  path: "/posts/{id}",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updatePostsSchema, "Post to update"),
  },
  middleware: [authMiddleware] as const,
  responses: {
    200: jsonContent(
      selectPostsSchema,
      "Updated post",
    ),
    422: jsonContent(
      createErrorSchema(insertPostsSchema).or(
        createErrorSchema(IdParamsSchema),
      ),
      "Validation error(s)",
    ),
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
    403: jsonContent(forbiddenErrorSchema, "Forbidden"),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});

export const remove = createRoute({
  summary: "deletes the selected post",
  description: "Delete the selected post",
  tags: ["Posts"],
  method: "delete",
  path: "/posts/{id}",
  request: {
    params: IdParamsSchema,
  },
  middleware: [authMiddleware] as const,
  responses: {
    204: {
      description: "Post deleted",
    },
    422: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
    403: jsonContent(forbiddenErrorSchema, "Forbidden"),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});

export type PostsRoute = typeof getAllPosts;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type GetByTag = typeof getByTag;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof remove;
