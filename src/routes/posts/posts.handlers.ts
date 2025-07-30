import { RouteHandler } from "@hono/zod-openapi";
import {
  CreateRoute,
  DeleteRoute,
  GetOneRoute,
  PostsRoute,
  UpdateRoute,
} from "./posts.routes.ts";
import {
  addPost,
  deletePost,
  getAllPosts,
  getOnePost,
  updatePost,
} from "../../db/queries.ts";

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

export const getOne: RouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const post = await getOnePost(id);

  if (!post) {
    return c.json({ success: false, message: "Not Found" }, 404);
  }

  return c.json(post, 200);
};

export const update: RouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const updatedPost = await updatePost(updates, id);

  if (!updatedPost) {
    return c.json({ success: false, message: "Not Found" }, 404);
  }

  return c.json(updatedPost, 200);
};

export const remove: RouteHandler<DeleteRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const result = await deletePost(id);

  if (result.length === 0) {
    return c.json({ success: false, message: "Not Found" }, 404);
  }

  return c.body(null, 204);
};
