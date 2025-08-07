import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import env from "../env.ts";
import comments from "../routes/comments/comments.main.ts";
import createApp from "../lib/create-app.ts";
import {
  initialComments,
  initialPosts,
  signUpAndGetCookie,
} from "./helpers/postHelper.ts";
import { db } from "../db/db.ts";
import { user } from "../db/schema.ts";
import posts from "../routes/posts/posts.main.ts";
import { Post } from "../types.ts";
import likes from "../routes/likes/likes.main.ts";

if (env.ENV !== "test") {
  throw new Error("ENV must be 'test'");
}
const postsClient = testClient(createApp().route("/api", posts));
const commentsClient = testClient(createApp().route("/api", comments));
const likesClient = testClient(createApp().route("/api", likes));

let cookie: string;
let postsInDb: Post[];
const commentsInDb: { id: string; content: string }[] = [];

beforeAll(async () => {
  await signUpAndGetCookie("Matti Tester", "test@test.com", "password123");
  cookie = await signUpAndGetCookie("John Doe", "john@doe.com", "password123");

  for (const post of initialPosts) {
    await postsClient.api.posts.$post({
      //@ts-expect-error: all good
      json: post,
    }, { headers: { Cookie: cookie } });
  }

  postsInDb = await db.query.posts.findMany();

  let i: number = 0;
  for (const post of postsInDb.slice(0, 2)) {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: { id: post.id },
      json: { content: initialComments[i] },
    }, { headers: { Cookie: cookie } });

    if (response.status === 201) {
      const comment = await response.json();
      const { id, content } = comment;
      commentsInDb.push({ id, content });
    }

    i++;
  }
});

afterAll(async () => {
  await db.delete(user);
});

describe("GET request to", () => {
  it("/api/posts/{id}/likes validates params", async () => {
    const response = await likesClient.api.posts[":id"].likes.$get({
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

  it("/api/posts/{id}/likes returns 404 Not Found when post not found", async () => {
    const response = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: crypto.randomUUID(),
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe("The post was not found");
    }
  });

  it("/api/posts/{id}/likes returns the number of likes for the post", async () => {
    const response = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const { success, likes } = await response.json();

      expect(success).toBe(true);
      expect(likes).toBe(0);
    }
  });

  it("/api/comments/{id}/likes validates params", async () => {
    const response = await likesClient.api.comments[":id"].likes.$get({
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

  it("/api/comments/{id}/likes returns 404 Not Found when comment not found", async () => {
    const response = await likesClient.api.comments[":id"].likes.$get({
      param: {
        id: crypto.randomUUID(),
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe("The comment was not found");
    }
  });

  it("/api/comments/{id}/likes returns the number of likes for the comment", async () => {
    const response = await likesClient.api.comments[":id"].likes.$get({
      param: {
        id: commentsInDb[0].id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const { success, likes } = await response.json();

      expect(success).toBe(true);
      expect(likes).toBe(0);
    }
  });
});

describe("POST request to", () => {
  it("/api/posts/{id}/likes validates params", async () => {
    const response = await likesClient.api.posts[":id"].like.$post({
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

  it("/api/posts/{id}/like throws 401 Not Authorized when not authorized", async () => {
    const response = await likesClient.api.posts[":id"].like.$post({
      param: {
        id: crypto.randomUUID(),
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/posts/{id}/like throws 404 Not Found when authorized and post not found", async () => {
    const response = await likesClient.api.posts[":id"].like.$post({
      param: {
        id: crypto.randomUUID(),
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe("The post was not found");
    }
  });

  it("/api/posts/{id}/like adds a like to the post when authorized", async () => {
    const likesNumberBefore = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    if (likesNumberBefore.status === 200) {
      const { likes } = await likesNumberBefore.json();
      expect(likes).toBe(0);
    }

    const response = await likesClient.api.posts[":id"].like.$post({
      param: {
        id: postsInDb[0].id,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(201);

    const likesNumberAfter = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    if (likesNumberAfter.status === 200) {
      const { likes } = await likesNumberAfter.json();
      expect(likes).toBe(1);
    }
  });

  it("/api/posts/{id}/like removes the like from the post when authorized", async () => {
    const likesNumberBefore = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    if (likesNumberBefore.status === 200) {
      const { likes } = await likesNumberBefore.json();
      expect(likes).toBe(1);
    }

    const response = await likesClient.api.posts[":id"].like.$post({
      param: {
        id: postsInDb[0].id,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(204);

    const likesNumberAfter = await likesClient.api.posts[":id"].likes.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    if (likesNumberAfter.status === 200) {
      const { likes } = await likesNumberAfter.json();
      expect(likes).toBe(0);
    }
  });

  it("/api/comments/{id}/likes validates params", async () => {
    const response = await likesClient.api.comments[":id"].like.$post({
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

  it("/api/comments/{id}/like throws 401 Not Authorized when not authorized", async () => {
    const response = await likesClient.api.comments[":id"].like.$post({
      param: {
        id: crypto.randomUUID(),
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/comments/{id}/like throws 404 Not Found when authorized and post not found", async () => {
    const response = await likesClient.api.comments[":id"].like.$post({
      param: {
        id: crypto.randomUUID(),
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe("The comment was not found");
    }
  });

  it("/api/comments/{id}/like adds a like to the comment when authorized", async () => {
    const likesNumberBefore = await likesClient.api.comments[":id"].likes.$get(
      {
        param: {
          id: commentsInDb[0].id,
        },
      },
    );
    if (likesNumberBefore.status === 200) {
      const { likes } = await likesNumberBefore.json();
      expect(likes).toBe(0);
    }

    const response = await likesClient.api.comments[":id"].like.$post({
      param: {
        id: commentsInDb[0].id,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(201);

    const likesNumberAfter = await likesClient.api.comments[":id"].likes.$get({
      param: {
        id: commentsInDb[0].id,
      },
    });
    if (likesNumberAfter.status === 200) {
      const { likes } = await likesNumberAfter.json();
      expect(likes).toBe(1);
    }
  });

  it("/api/comments/{id}/like removes the like from the comment when authorized", async () => {
    const likesNumberBefore = await likesClient.api.comments[":id"].likes.$get({
      param: {
        id: commentsInDb[0].id,
      },
    });
    if (likesNumberBefore.status === 200) {
      const { likes } = await likesNumberBefore.json();
      expect(likes).toBe(1);
    }

    const response = await likesClient.api.comments[":id"].like.$post({
      param: {
        id: commentsInDb[0].id,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(204);

    const likesNumberAfter = await likesClient.api.comments[":id"].likes.$get({
      param: {
        id: commentsInDb[0].id,
      },
    });
    if (likesNumberAfter.status === 200) {
      const { likes } = await likesNumberAfter.json();
      expect(likes).toBe(0);
    }
  });
});
