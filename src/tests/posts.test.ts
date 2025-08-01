import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import posts from "../routes/posts/posts.main.ts";
import { posts as dbPosts, user } from "../db/schema.ts";
import createApp from "../lib/create-app.ts";
import env from "../env.ts";
import { db } from "../db/db.ts";
import { getCookie, getRandomPost, signUp } from "./helpers/postHelper.ts";

if (env.ENV !== "test") {
  throw new Error("ENV must be 'test'");
}

const client = testClient(createApp().route("/api", posts), {
  init: {
    credentials: "include",
  },
});

describe("posts routes", () => {
  beforeAll(async () => {
    await signUp();
  });

  afterAll(async () => {
    await db.delete(dbPosts);
    await db.delete(user);
  });

  it("POST /api/posts validates the body when authorized", async () => {
    const cookie = await getCookie();

    const response = await client.api.posts.$post({
      // @ts-expect-error: testing failure
      json: {
        content: "This test fails",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("title");
      expect(Object.values(json.errors[0])[0]).toBe(
        "Invalid input: expected string, received undefined",
      );
    }
  });

  it("POST /api/posts creates a post when authorized", async () => {
    const cookie = await getCookie();

    const response = await client.api.posts.$post({
      json: {
        title: "Awful testing experience",
        content: "This is a test post",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(201);
    if (response.status === 201) {
      const json = await response.json();
      expect(json.title).toBe("Awful testing experience");
      expect(json.content).toBe("This is a test post");
    }
  });

  it("GET /api/posts lists all posts", async () => {
    const response = await client.api.posts.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    }
  });

  it("GET /api/posts/{id} validates the id param", async () => {
    const response = await client.api.posts[":id"].$get({
      param: {
        id: "id",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("id");
      expect(Object.values(json.errors[0])[0]).toBe("Invalid UUID");
    }
  });

  it("GET /api/posts/{id} returns 404 when post not found", async () => {
    const response = await client.api.posts[":id"].$get({
      param: {
        id: crypto.randomUUID(),
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe("Not Found");
    }
  });

  it("GET /api/posts/{id} gets a single post", async () => {
    const post = await getRandomPost();
    const response = await client.api.posts[":id"].$get({
      param: {
        //@ts-ignore: no null
        id: post.id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.title).toBe("Awful testing experience");
      expect(json.content).toBe("This is a test post");
    }
  });

  it("PATCH /api/posts/{id} validates the body when authorized", async () => {
    const cookie = await getCookie();
    const post = await getRandomPost();
    const response = await client.api.posts[":id"].$patch({
      param: {
        //@ts-ignore: not null
        id: post.id,
      },
      json: {
        title: "",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("title");
      expect(Object.values(json.errors[0])[0]).toBe(
        "Title must be at least 5 characters long",
      );
    }
  });

  it("PATCH /api/posts/{id} validates the id param when authorized", async () => {
    const cookie = await getCookie();

    const response = await client.api.posts[":id"].$patch({
      param: {
        id: "wat",
      },
      json: {},
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("id");
      expect(Object.values(json.errors[0])[0]).toBe("Invalid UUID");
    }
  });

  /*it("PATCH /api/posts/{id} validates empty body when authorized", async () => {
    const cookie = await getCookie();
    const post = await getRandomPost();

    const response = await client.api.posts[":id"].$patch({
      param: {
        //@ts-ignore: not undefined
        id: post.id,
      },
      json: {},
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      console.log(json.errors);
      expect(Object.keys(json.errors[0])[0]).toBe("id");
      expect(Object.values(json.errors[0])[0]).toBe("Invalid UUID");
    }
  });*/

  it("PATCH /api/posts/{id} updates a single property of a post when authorized", async () => {
    const cookie = await getCookie();
    const post = await getRandomPost();

    const response = await client.api.posts[":id"].$patch({
      param: {
        //@ts-ignore: not undefined
        id: post.id,
      },
      json: {
        content: "I changed the content",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();

      //@ts-ignore: post is defined
      expect(json.title).toBe(post.title);
      //@ts-ignore: post is defined
      expect(json.content).not.toBe(post.content);
      expect(json.content).toBe("I changed the content");
    }
  });

  it("DELETE /api/posts/{id} validates the id when authorized", async () => {
    const cookie = await getCookie();

    const response = await client.api.posts[":id"].$delete({
      param: {
        id: "wat",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("id");
      expect(Object.values(json.errors[0])[0]).toBe("Invalid UUID");
    }
  });

  it("DELETE /api/posts/{id} removes a post", async () => {
    const cookie = await getCookie();
    const post = await getRandomPost();

    const response = await client.api.posts[":id"].$delete({
      param: {
        //@ts-ignore: post is defined
        id: post.id,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(204);
  });
});
