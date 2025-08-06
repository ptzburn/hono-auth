import { RouteHandler } from "@hono/zod-openapi";
import { CreatePostRoute, GetPostRoute } from "./likes.routes.ts";
import { getLikesNumber, likeUnlike } from "../../db/queries.ts";

export const getForPosts: RouteHandler<GetPostRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const { statusCode, likes } = await getLikesNumber("postLikes", id);

  if (statusCode === 404) {
    return c.json(
      { success: false, message: "The post was not found" },
      statusCode,
    );
  }

  return c.json({ success: true, likes }, 200);
};

export const createForPosts: RouteHandler<CreatePostRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const response = await likeUnlike("postLikes", user.id, id);

  if (response.statusCode === 404) {
    return c.json(
      { success: false, message: "The post was not found" },
      response.statusCode,
    );
  }

  if (response.statusCode === 204) {
    return c.body(null, response.statusCode);
  }

  return c.body(null, 201);
};

export const getForComments: RouteHandler<GetPostRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const { statusCode, likes } = await getLikesNumber("commentLikes", id);

  if (statusCode === 404) {
    return c.json(
      { success: false, message: "The comment was not found" },
      statusCode,
    );
  }

  return c.json({ success: true, likes }, 200);
};

export const createForComments: RouteHandler<CreatePostRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const response = await likeUnlike("commentLikes", user.id, id);

  if (response.statusCode === 404) {
    return c.json(
      { success: false, message: "The comment was not found" },
      response.statusCode,
    );
  }

  if (response.statusCode === 204) {
    return c.body(null, response.statusCode);
  }

  return c.body(null, 201);
};
