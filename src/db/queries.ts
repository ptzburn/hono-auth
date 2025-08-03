import { db } from "./db.ts";
import { NewComment, NewPost, PostUpdate } from "../types.ts";
import { comments, posts } from "./schema.ts";
import { arrayContains, desc, eq, sql } from "drizzle-orm";

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
  await db.update(posts).set({ viewsCount: sql`${posts.viewsCount} + 1` })
    .where(eq(posts.id, id));
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  return post;
};

export const postsWithTag = async (tagName: string) => {
  const taggedPosts = await db
    .select()
    .from(posts)
    .where(arrayContains(posts.tags, [tagName]))
    .orderBy(desc(posts.createdAt));

  return taggedPosts;
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

export const addComment = async (
  comment: NewComment,
) => {
  const [result] = await db.insert(comments).values(comment).returning();

  return result;
};
