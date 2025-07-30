import { describe, it } from "@std/testing/bdd";
import router from "../routes/posts/posts.main.ts";
import { expect } from "@std/expect";
import { createTestApp } from "../lib/create-app.ts";

describe("GET to posts", () => {
  it("should respond with an array", async () => {
    const testRouter = createTestApp(router);
    const response = await testRouter.request("/api/posts");
    const result = await response.json();

    console.log(result);

    expect(Array.isArray(result)).toBe(true);
  });
});
