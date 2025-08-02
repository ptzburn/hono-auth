import { db } from "../../db/db.ts";
import { auth } from "../../lib/auth.ts";

export async function signUpAndGetCookie() {
  const signUpResponse = await auth.api.signUpEmail({
    body: {
      name: "tester",
      email: "test@test.com",
      password: "password123",
    },
    asResponse: true,
  });

  return signUpResponse.headers.get("set-cookie") || "oops";
}

export async function getCookie() {
  const signInResponse = await auth.api.signInEmail({
    body: {
      email: "test@test.com",
      password: "password123",
    },
    asResponse: true,
  });

  return signInResponse.headers.get("set-cookie") || "oops";
}

export const initialPosts = [
  { title: "Test Post 1", content: "Test Content 1" },
  { title: "Test Post 2", content: "Test Content 2" },
  { title: "Test Post 3", content: "Test Content 3" },
];

export async function getFirstPost() {
  return await db.query.posts.findFirst();
}
