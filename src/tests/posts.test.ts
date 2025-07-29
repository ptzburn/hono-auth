/*import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { stub } from "jsr:@std/testing/mock";

beforeEach(async () => {
  ctx = await createTestDb();
});

afterEach(async () => {
  await destroyTestDb(ctx);
});

describe("insertTodo", () => {
  // New unit test with stubbed DB
  it("should insert a todo with stubbed database", async () => {
    // Stub the db.insert call
    const mockTodo = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "456e7890-e89b-12d3-a456-426614174001",
      title: "Test todo",
      description: "Test description",
      completed: false,
      createdAt: new Date(),
    };

    const insertStub = stub(
      db,
      "insert",
      () => ({
        values: () => ({
          returning: () => Promise.resolve([mockTodo]),
        }),
      }),
    );

    try {
      const newTodo = {
        userId: mockTodo.userId,
        title: "Test todo",
        description: "Test description",
      } as NewTodo;

      const todo = await insertTodo(newTodo);

      assertEquals(todo.userId, newTodo.userId);
      assertEquals(todo.id, mockTodo.id);
      assertEquals(todo.title, newTodo.title);
      assertExists(todo.id);
    } finally {
      insertStub.restore(); // Clean up the stub
    }
  });
});
