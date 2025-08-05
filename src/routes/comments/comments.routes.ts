import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "../../utils/openapi/json-content.ts";
import { insertCommentsSchema, selectCommentsSchema } from "../../db/schema.ts";
import jsonContentRequired from "../../utils/openapi/json-content-required.ts";
import createErrorSchema from "../../utils/openapi/create-error-schema.ts";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import unauthorizedErrorSchema from "../../utils/openapi/unauthorized-schema.ts";
import IdParamsSchema from "../../utils/openapi/id-params-schema.ts";
import forbiddenErrorSchema from "../../utils/openapi/forbidden-schema.ts";

export const get = createRoute({
  tags: ["Comments"],
  method: "get",
  path: "/posts/{id}/comments",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: jsonContent(
      z.array(selectCommentsSchema),
      "Requested comments",
    ),
    422: jsonContent(
      createErrorSchema(insertCommentsSchema),
      "Invalid id error",
    ),
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "No comments were found",
    ),
  },
});

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
    404: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }).openapi({
        example: { success: false, message: "Not Found" },
      }),
      "Comment not found",
    ),
  },
});

export const update = createRoute({
  tags: ["Comments"],
  method: "patch",
  path: "/comments/{id}",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(insertCommentsSchema, "Comment to update"),
  },
  middleware: [authMiddleware] as const,
  responses: {
    200: jsonContent(
      selectCommentsSchema,
      "Updated comment",
    ),
    422: jsonContent(
      createErrorSchema(insertCommentsSchema).or(
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
      "Comment not found",
    ),
  },
});

export const remove = createRoute({
  tags: ["Comments"],
  method: "delete",
  path: "/comments/{id}",
  request: {
    params: IdParamsSchema,
  },
  middleware: [authMiddleware] as const,
  responses: {
    204: {
      description: "Comment deleted",
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
      "Comment not found",
    ),
  },
});

export type GetRoute = typeof get;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof remove;
