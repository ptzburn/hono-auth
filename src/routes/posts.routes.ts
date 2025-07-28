import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { addPost, getAllPosts } from "../db/queries.ts";
import type { HonoEnv } from "../types.ts";
import { createPostValidator } from "../validators/create-post.validator.ts";

export const posts = new Hono<HonoEnv>();

posts.get("/", async (c) => {
  try {
    const allPosts = await getAllPosts();
    return c.json(allPosts);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return c.json({ success: false, error: "Failed to fetch posts" }, 500);
  }
});

posts.post("/", authMiddleware, createPostValidator, async (c) => {
  const user = c.get("user");
  const postData = c.req.valid("json");

  try {
    const newPost = await addPost({
      ...postData,
      userId: user.id,
    });

    return c.json({ success: true, newPost }, 201);
  } catch (error) {
    console.error("Error creating post: ", error);
    return c.json({ success: false, error: "Failed to create post" }, 500);
  }
});
