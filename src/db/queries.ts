import { db } from "./db.ts";
import { NewComment, NewPost, PostUpdate } from "../types.ts";
import { comments, posts } from "./schema.ts";
import { and, arrayContains, desc, eq, sql } from "drizzle-orm";

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
  userId: typeof posts.$inferSelect.userId,
) => {
  const [result] = await db.update(posts).set(updates).where(
    and(eq(posts.id, id), eq(posts.userId, userId)),
  ).returning();

  if (!result) {
    const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });

    if (!post) {
      return { statusCode: 404 };
    }

    return { statusCode: 403 };
  }

  return { statusCode: 200, data: result };
};

export const deletePost = async (
  id: typeof posts.$inferSelect.id,
  userId: typeof posts.$inferSelect.userId,
) => {
  const result = await db.delete(posts).where(
    and(eq(posts.id, id), eq(posts.userId, userId)),
  ).returning();

  if (result.length === 0) {
    const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });

    if (!post) {
      return { statusCode: 404 };
    }

    return { statusCode: 403 };
  }

  return { statusCode: 204 };
};

export const getComments = async (postId: typeof posts.$inferSelect.id) => {
  const fetchedComments = await db.select().from(comments).where(
    eq(comments.postId, postId),
  ).orderBy(
    desc(comments.createdAt),
  );

  return fetchedComments;
};

export const addComment = async (
  comment: NewComment,
) => {
  const postToComment = await db.query.posts.findFirst({
    where: eq(posts.id, comment.postId),
    columns: { id: true },
  });

  if (!postToComment) {
    return { statusCode: 404 };
  }

  const [result] = await db.insert(comments).values(comment).returning();

  return { statusCode: 201, data: result };
};

export const deleteComment = async (
  id: typeof comments.$inferSelect.id,
  userId: typeof comments.$inferSelect.userId,
) => {
  const result = await db.delete(comments).where(
    and(
      eq(comments.id, id),
      eq(comments.userId, userId),
    ),
  ).returning();

  if (result.length === 0) {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (!comment) {
      return { statusCode: 404 };
    }

    return { statusCode: 403 };
  }

  return { statuCode: 204 };
};
