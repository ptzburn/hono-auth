import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import jsonContent from "../../utils/openapi/json-content.ts";
import { insertPostsSchema, selectPostsSchema } from "../../db/schema.ts";
import jsonContentRequired from "../../utils/openapi/json-content-required.ts";
import createErrorSchema from "../../utils/openapi/create-error-schema.ts";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import unauthorizedErrorSchema from "../../utils/openapi/unauthorized-schema.ts";

export const getAllPosts = createRoute({
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

export type PostsRoute = typeof getAllPosts;
export type CreateRoute = typeof create;
