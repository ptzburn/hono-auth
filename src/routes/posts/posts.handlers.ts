import { RouteHandler } from "@hono/zod-openapi";
import {
  CreateRoute,
  DeleteRoute,
  GetByTag,
  GetOneRoute,
  PostsRoute,
  UpdateRoute,
} from "./posts.routes.ts";
import {
  addPost,
  deletePost,
  getAllPosts,
  getOnePost,
  postsWithTag,
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

export const getByTag: RouteHandler<GetByTag> = async (c) => {
  const { tagName } = c.req.valid("param");
  const taggedPosts = await postsWithTag(tagName);

  if (taggedPosts.length === 0) {
    return c.json({ success: false, message: "Not Found" }, 404);
  }

  return c.json(taggedPosts, 200);
};

export const update: RouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const user = c.get("user");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        errors: [
          {
            message: "No updates provided",
          },
        ],
      },
      422,
    );
  }

  const result = await updatePost(updates, id, user.id);

  if (result.statusCode === 404) {
    return c.json(
      { success: false, message: "Post not found" },
      result.statusCode,
    );
  }

  if (result.statusCode === 403) {
    return c.json({
      success: false,
      message: "You are not authorized to edit this post",
    }, result.statusCode);
  }

  return c.json(result.data, 200);
};

export const remove: RouteHandler<DeleteRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const result = await deletePost(id, user.id);

  if (result.statusCode === 404) {
    return c.json(
      { success: false, message: "Post not found" },
      result.statusCode,
    );
  }

  if (result.statusCode === 403) {
    return c.json({
      success: false,
      message: "You are not authorized to delete this post",
    }, result.statusCode);
  }

  return c.body(null, 204);
};
