import { db } from "./db.ts";
import { NewPost } from "../types.ts";
import { posts } from "./schema.ts";
import { desc } from "drizzle-orm";

export const getAllPosts = async () => {
  const returnedPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  return returnedPosts;
};

export const addPost = async (post: NewPost) => {
  const [result] = await db.insert(posts).values(post).returning();

  return result;
};
