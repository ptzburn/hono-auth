import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import posts from "../routes/posts/posts.main.ts";
import { posts as dbPosts, user } from "../db/schema.ts";
import createApp from "../lib/create-app.ts";
import env from "../env.ts";
import { db } from "../db/db.ts";
import {
  getFirstPost,
  initialPosts,
  signUpAndGetCookie,
} from "./helpers/postHelper.ts";

if (env.ENV !== "test") {
  throw new Error("ENV must be 'test'");
}

const client = testClient(createApp().route("/api", posts));
let cookie: string;

beforeAll(async () => {
  cookie = await signUpAndGetCookie();

  for (const post of initialPosts) {
    await client.api.posts.$post({
      //@ts-expect-error: all good
      json: post,
    }, { headers: { Cookie: cookie } });
  }
});

afterAll(async () => {
  await db.delete(dbPosts);
  await db.delete(user);
});

describe("GET request to", () => {
  it("/api/posts returns all posts", async () => {
    const response = await client.api.posts.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    }
  });

  it("/api/posts/{id} validates the id param", async () => {
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

  it("/api/posts/{id} returns 404 when post not found", async () => {
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

  it("/api/posts/{id} gets a single post", async () => {
    const post = await getFirstPost();
    const response = await client.api.posts[":id"].$get({
      param: {
        //@ts-ignore: no null
        id: post.id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.title).toBe("Test Post 1");
      expect(json.content).toBe("Test Content 1");
    }
  });

  it("/api/posts/tags/{tagName} returns 404 when no posts with the tag were found", async () => {
    const response = await client.api.posts.tags[":tagName"].$get({
      param: {
        tagName: "not found",
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe("Not Found");
    }
  });

  it("/api/posts/tags/{tagName} returns all tagged posts", async () => {
    const response = await client.api.posts.tags[":tagName"].$get({
      param: {
        //@ts-ignore: no null
        tagName: "deno",
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const array = await response.json();
      expect(array.length).toBe(1);
      expect(array[0].title).toBe("Test Post 2");
      expect(array[0].content).toBe("Test Content 2");
    }
  });
});

describe("PATCH request to", () => {
  it("/api/posts/{id} validates the body when authorized", async () => {
    const post = await getFirstPost();
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
        "Title must be at least 3 characters long",
      );
    }
  });

  it("/api/posts/{id} validates the id param when authorized", async () => {
    const response = await client.api.posts[":id"].$patch({
      param: {
        id: "id",
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
});

it("/api/posts/{id} validates empty body when authorized", async () => {
  const post = await getFirstPost();

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

    expect(Object.keys(json.errors[0])[0]).toBe("message");
    expect(Object.values(json.errors[0])[0]).toBe("No updates provided");
  }
});

it("/api/posts/{id} updates a single property of a post when authorized", async () => {
  const post = await getFirstPost();

  const response = await client.api.posts[":id"].$patch({
    param: {
      //@ts-ignore: not undefined
      id: post.id,
    },
    json: {
      content: "Changed Content",
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
    expect(json.content).toBe("Changed Content");
  }
});

it("/api/posts/{id} returns Unauthorized when not authorized", async () => {
  const response = await client.api.posts[":id"].$patch({
    param: {
      id: "id",
    },
    json: {},
  });
  expect(response.status).toBe(401);
  if (response.status === 401) {
    const json = await response.json();

    expect(json.success).toBe(false);
    expect(json.errors).toBe("Unauthorized");
  }
});

describe("POST request to", () => {
  it("/api/posts validates the body when authorized", async () => {
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

  it("/api/posts returns Unauthorized when not authorized", async () => {
    const response = await client.api.posts.$post({
      //@ts-expect-error: all good
      json: {
        title: "New Test Post",
        content: "New Content",
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/posts creates a post when authorized", async () => {
    const response = await client.api.posts.$post({
      //@ts-expect-error: all good
      json: {
        title: "New Test Post",
        content: "New Content",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(201);
    if (response.status === 201) {
      const json = await response.json();
      expect(json.title).toBe("New Test Post");
      expect(json.content).toBe("New Content");
    }
  });
});

describe("DELETE request to", () => {
  it("/api/posts/{id} validates the id when authorized", async () => {
    const response = await client.api.posts[":id"].$delete({
      param: {
        id: "id",
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

  it("/api/posts/{id} returns Unauthorized when not authorized", async () => {
    const post = await getFirstPost();

    const response = await client.api.posts[":id"].$delete({
      param: {
        //@ts-ignore: post is defined
        id: post.id,
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/posts/{id} removes a post when authorized", async () => {
    const post = await getFirstPost();

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
