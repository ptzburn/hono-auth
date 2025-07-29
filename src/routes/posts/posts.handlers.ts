import { RouteHandler } from "@hono/zod-openapi";
import { CreateRoute, PostsRoute } from "./posts.routes.ts";
import { addPost, getAllPosts } from "../../db/queries.ts";

export const allPosts: RouteHandler<PostsRoute> = async (c) => {
  const allPosts = await getAllPosts();
  return c.json(allPosts);
};

export const createPost: RouteHandler<CreateRoute> = async (c) => {
  const user = c.get("user");
  const postData = c.req.valid("json");

  const newPost = await addPost({
    ...postData,
    userId: user.id,
  });

  return c.json(newPost, 201);
};
