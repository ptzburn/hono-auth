import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import jsonContent from "../../utils/openapi/json-content.ts";
import { selectPostsSchema } from "../../db/schema.ts";

export const allPosts = createRoute({
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

export type PostsRoute = typeof allPosts;
