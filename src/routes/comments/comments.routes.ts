import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import jsonContent from "../../utils/openapi/json-content.ts";
import { insertCommentsSchema, selectCommentsSchema } from "../../db/schema.ts";
import jsonContentRequired from "../../utils/openapi/json-content-required.ts";
import createErrorSchema from "../../utils/openapi/create-error-schema.ts";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import unauthorizedErrorSchema from "../../utils/openapi/unauthorized-schema.ts";
import IdParamsSchema from "../../utils/openapi/id-params-schema.ts";
import TagParamsSchema from "../../utils/openapi/tag-params-schema.ts";

export const create = createRoute({
  tags: ["Comments"],
  method: "post",
  path: "/posts/{id}/comments",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(insertCommentsSchema, "Comment to create"),
  },
  middleware: [authMiddleware] as const,
  responses: {
    201: jsonContent(
      selectCommentsSchema,
      "Created comment",
    ),
    422: jsonContent(
      createErrorSchema(insertCommentsSchema).or(
        createErrorSchema(IdParamsSchema),
      ),
      "Validation error(s)",
    ),
    401: jsonContent(unauthorizedErrorSchema, "Unauthorized"),
  },
});

/*export const getOne = createRoute({
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
  tags: ["Posts"],
  method: "get",
  path: "/posts/tags/{tagName}",
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
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});

export const remove = createRoute({
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
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Post not found",
    ),
  },
});*/

//export type GetRoute = typeof get;
export type CreateRoute = typeof create;
/*export type GetOneRoute = typeof getOne;
export type GetByTag = typeof getByTag;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof remove;*/
