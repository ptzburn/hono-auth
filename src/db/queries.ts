import { db } from "./db.ts";
import { NewTodo } from "../types.ts";
import { todos } from "./schema.ts";
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
