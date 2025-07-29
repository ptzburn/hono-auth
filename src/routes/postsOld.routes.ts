import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { addPost, getAllPosts } from "../db/queries.ts";
import type { HonoEnv } from "../types.ts";
import { createPostValidator } from "../validators/create-post.validator.ts";

export const posts = new Hono<HonoEnv>();

posts.get("/", async (c) => {
  const allPosts = await getAllPosts();
  return c.json(allPosts);
});

posts.post("/", authMiddleware, createPostValidator, async (c) => {
  const user = c.get("user");
  const postData = c.req.valid("json");

  const newPost = await addPost({
    ...postData,
    userId: user.id,
  });

  return c.json({ success: true, newPost }, 201);
});
