import { db } from "./db.ts";
import { NewComment, NewPost, PostUpdate } from "../types.ts";
import { commentLikes, comments, postLikes, posts } from "./schema.ts";
import { and, arrayContains, count, desc, eq, sql } from "drizzle-orm";

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

  if (fetchedComments.length === 0) {
    const postWithComments = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { id: true },
    });

    if (!postWithComments) {
      return { statusCode: 404 };
    }
  }

  return { statusCode: 200, data: fetchedComments };
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

export const updateComment = async (
  updates: { content: string },
  id: typeof comments.$inferSelect.id,
  userId: typeof comments.$inferSelect.userId,
) => {
  const [result] = await db.update(comments).set(updates).where(
    and(eq(comments.id, id), eq(comments.userId, userId)),
  ).returning();

  if (!result) {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (!comment) {
      return { statusCode: 404 };
    }

    return { statusCode: 403 };
  }

  return { statusCode: 200, data: result };
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

  return { statusCode: 204 };
};

export const getLikesNumber = async (
  tableName: string,
  id: typeof posts.$inferSelect.id,
) => {
  const tables = tableName === "postLikes"
    ? [postLikes, posts]
    : [commentLikes, comments];
  const properties = tableName === "postLikes"
    ? [postLikes.postId, posts.id]
    : [commentLikes.commentId, comments.id];

  const [likesNumber] = await db.select({ count: count() }).from(tables[0])
    .where(
      eq(properties[0], id),
    );

  if (likesNumber.count === 0) {
    const postOrComment = await db.select().from(
      tables[1],
    ).where(
      eq(properties[1], id),
    );

    if (postOrComment.length === 0) {
      return { statusCode: 404, likes: 0 };
    }
  }

  return { statusCode: 200, likes: likesNumber.count };
};

export const likeUnlike = async (
  tableName: string,
  userId: typeof postLikes.$inferSelect.userId,
  id: typeof postLikes.$inferSelect.postId,
) => {
  const tables = tableName === "postLikes"
    ? [posts, postLikes]
    : [comments, commentLikes];
  const properties = tableName === "postLikes"
    ? [posts.id, postLikes.postId, postLikes.userId]
    : [comments.id, commentLikes.commentId, commentLikes.userId];

  const [postOrComment] = await db.select().from(tables[0]).where(
    eq(properties[0], id),
  );

  if (!postOrComment) {
    return { statusCode: 404 };
  }

  const [existingLike] = await db.select().from(tables[1]).where(
    and(eq(properties[1], id), eq(properties[2], userId)),
  );

  if (existingLike) {
    await db.delete(tables[1]).where(
      and(eq(properties[1], id), eq(properties[2], userId)),
    );
    return { statusCode: 204 };
  }

  const json = tableName === "postLikes"
    ? { userId, postId: id }
    : { userId, commentId: id };

  await db.insert(tables[1]).values(json);

  return { statusCode: 201 };
};
