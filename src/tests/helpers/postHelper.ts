import { db } from "../../db/db.ts";
import { auth } from "../../lib/auth.ts";

export async function signUp() {
  return await auth.api.signUpEmail({
    body: {
      name: "tester",
      email: "test@test.com",
      password: "password123",
    },
  });
}

export async function getCookie() {
  const signUpResponse = await auth.api.signInEmail({
    body: {
      email: "test@test.com",
      password: "password123",
    },
    asResponse: true,
  });

  return signUpResponse.headers.get("set-cookie") || "oops";
}

export async function getRandomPost() {
  return await db.query.posts.findFirst();
}
