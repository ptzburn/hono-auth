import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import env from "../env.ts";
import comments from "../routes/comments/comments.main.ts";
import createApp from "../lib/create-app.ts";
import {
  initialComments,
  initialPosts,
  longComment,
  signInAndGetCookie,
  signUpAndGetCookie,
} from "./helpers/postHelper.ts";
import { db } from "../db/db.ts";
import { user } from "../db/schema.ts";
import posts from "../routes/posts/posts.main.ts";
import { Post } from "../types.ts";

if (env.ENV !== "test") {
  throw new Error("ENV must be 'test'");
}
const postsClient = testClient(createApp().route("/api", posts));
const commentsClient = testClient(createApp().route("/api", comments));

let cookie: string;
let postsInDb: Post[];

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
    await commentsClient.api.posts[":id"].comments.$post({
      param: { id: post.id },
      json: { content: initialComments[i] },
    }, { headers: { Cookie: cookie } });
    i++;
  }
});

afterAll(async () => {
  await db.delete(user);
});

describe("GET request to", () => {
  it("/api/posts/{id}/comments validates the id param", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$get({
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

  it("/api/posts/{id}/comments returns 404 Not Found if there are no comments under the post", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$get({
      param: {
        id: postsInDb[2].id,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe("Not Found");
    }
  });

  it("/api/posts/{id}/comments returns all the comments under the post", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$get({
      param: {
        id: postsInDb[0].id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();

      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(1);
      expect(json[0].content).toBe("Awesome!");
    }
  });
});

describe("POST request to", () => {
  it("/api/posts/{id}/comments throws 404 Not Found when authorized and post not found", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: crypto.randomUUID(),
      },
      json: {
        content: "This test is about to fail",
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
      expect(json.message).toBe(
        "The post you tried to comment was not found",
      );
    }
  });

  it("/api/posts/{id}/comments validates param id when authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: "id",
      },
      json: {
        content: "This test is about to fail",
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
      expect(Object.values(json.errors[0])[0]).toBe(
        "Invalid UUID",
      );
    }
  });

  it("/api/posts/{id}/comments validates body when authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: postsInDb[2].id,
      },
      //@ts-expect-error: for failing test
      json: {},
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("content");
      expect(Object.values(json.errors[0])[0]).toBe(
        "Invalid input: expected string, received undefined",
      );
    }
  });

  it("/api/posts/{id}/comments checks min content length when authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: postsInDb[2].id,
      },
      json: {
        content: "",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("content");
      expect(Object.values(json.errors[0])[0]).toBe(
        "Comment must be at least 1 character long",
      );
    }
  });

  it("/api/posts/{id}/comments checks max content length when authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: postsInDb[2].id,
      },
      json: {
        content: longComment,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();

      expect(Object.keys(json.errors[0])[0]).toBe("content");
      expect(Object.values(json.errors[0])[0]).toBe(
        "Comment is too long. Maximum length is 500",
      );
    }
  });

  it("/api/posts/{id}/comments returns 401 Unauthorized when not authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: postsInDb[2].id,
      },
      json: {
        content: "This comment won't get published",
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/posts/{id}/comments creates a comment when authorized", async () => {
    const response = await commentsClient.api.posts[":id"].comments.$post({
      param: {
        id: postsInDb[2].id,
      },
      json: {
        content: "Like it!",
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });

    expect(response.status).toBe(201);
    if (response.status === 201) {
      const json = await response.json();
      expect(json.content).toBe("Like it!");
    }
  });
});

describe("DELETE request to", () => {
  it("/api/comments/{id} validates the id when authorized", async () => {
    const response = await commentsClient.api.comments[":id"].$delete({
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

  it("/api/comments/{id} returns 401 Unauthorized when not authorized", async () => {
    const response = await commentsClient.api.comments[":id"].$delete({
      param: {
        id: postsInDb[0].id,
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.errors).toBe("Unauthorized");
    }
  });

  it("/api/comments/{id} returns Not Found when authorized and comment does not exist", async () => {
    const response = await commentsClient.api.comments[":id"].$delete({
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

  it("/api/comments/{id} returns Forbidden when authorized user tries to delete another's comment", async () => {
    cookie = await signInAndGetCookie(
      "test@test.com",
      "password123",
    );
    const commentResponse = await commentsClient.api.posts[":id"].comments.$get(
      {
        param: {
          id: postsInDb[0].id,
        },
      },
    );

    let commentId: string = crypto.randomUUID();

    if (commentResponse.status === 200) {
      const [comment] = await commentResponse.json();
      const { id } = comment;
      commentId = id;
    }

    const response = await commentsClient.api.comments[":id"].$delete({
      param: {
        id: commentId,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });

    expect(response.status).toBe(403);
    if (response.status === 403) {
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.message).toBe(
        "You are not authorized to delete this comment",
      );
    }
    cookie = await signInAndGetCookie("john@doe.com", "password123");
  });

  it("/api/comments/{id} removes the comment when authorized", async () => {
    const commentResponse = await commentsClient.api.posts[":id"].comments.$get(
      {
        param: {
          id: postsInDb[0].id,
        },
      },
    );

    let commentId: string = crypto.randomUUID();

    if (commentResponse.status === 200) {
      const [comment] = await commentResponse.json();
      const { id } = comment;
      commentId = id;
    }

    const response = await commentsClient.api.comments[":id"].$delete({
      param: {
        id: commentId,
      },
    }, {
      headers: {
        Cookie: cookie,
      },
    });
    expect(response.status).toBe(204);
  });
});
