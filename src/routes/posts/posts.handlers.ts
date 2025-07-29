import { RouteHandler } from "@hono/zod-openapi";
import { PostsRoute } from "./posts.routes.ts";
import { getAllPosts } from "../../db/queries.ts";

export const allPosts: RouteHandler<PostsRoute> = async (c) => {
  const allPosts = await getAllPosts();
  return c.json(allPosts);
};
