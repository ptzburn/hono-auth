import { db } from "./db.ts";
import { NewPost, PostUpdate } from "../types.ts";
import { posts, updatePostsSchema } from "./schema.ts";
import { desc, eq } from "drizzle-orm";

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

export const getOnePost = async (id: typeof posts.$inferSelect.id) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  return post;
};

export const updatePost = async (
  updates: PostUpdate,
  id: typeof posts.$inferSelect.id,
) => {
  const [result] = await db.update(posts).set(updates).where(eq(posts.id, id))
    .returning();

  return result;
};

export const deletePost = async (
  id: typeof posts.$inferSelect.id,
) => {
  const result = await db.delete(posts).where(eq(posts.id, id)).returning();

  return result;
};
