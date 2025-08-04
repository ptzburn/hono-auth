import { RouteHandler } from "@hono/zod-openapi";
import { CreateRoute, DeleteRoute, GetRoute } from "./comments.routes.ts";
import { addComment, deleteComment, getComments } from "../../db/queries.ts";

export const get: RouteHandler<GetRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const comments = await getComments(id);

  if (comments.length === 0) {
    return c.json({ success: false, message: "Not Found" }, 404);
  }

  return c.json(comments, 200);
};

export const create: RouteHandler<CreateRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  const commentData = c.req.valid("json");

  const newComment = await addComment({
    ...commentData,
    userId: user.id,
    postId: id,
  });

  if (newComment.statusCode === 404) {
    return c.json(
      {
        success: false,
        message: "The post you tried to comment was not found",
      },
      newComment.statusCode,
    );
  }

  return c.json(newComment.data, 201);
};

export const remove: RouteHandler<DeleteRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const result = await deleteComment(id, user.id);

  if (result.statusCode === 404) {
    return c.json(
      { success: false, message: "The comment was not found" },
      result.statusCode,
    );
  }

  if (result.statusCode === 403) {
    return c.json({
      success: false,
      message: "You are not authorized to delete this comment",
    }, result.statusCode);
  }

  return c.body(null, 204);
};
