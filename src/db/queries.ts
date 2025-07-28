import { db } from "./db.ts";
import { NewPost, NewTodo } from "../types.ts";
import { posts, todos } from "./schema.ts";
import { desc, eq } from "drizzle-orm";

export const insertTodo = async (todo: NewTodo) => {
  const [result] = await db.insert(todos).values(todo).returning();

  return result;
};

export const getTodosByUserId = async (userId: string) => {
  const todoList = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));

  return todoList;
};

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
