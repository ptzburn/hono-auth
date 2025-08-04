import { db } from "../../db/db.ts";
import { auth } from "../../lib/auth.ts";

export async function signUpAndGetCookie(
  name: string,
  email: string,
  password: string,
) {
  const signUpResponse = await auth.api.signUpEmail({
    body: {
      name: name,
      email: email,
      password: password,
    },
    asResponse: true,
  });

  return signUpResponse.headers.get("set-cookie") || "oops";
}

export async function signInAndGetCookie(email: string, password: string) {
  const signInResponse = await auth.api.signInEmail({
    body: {
      email: email,
      password: password,
    },
    asResponse: true,
  });

  return signInResponse.headers.get("set-cookie") || "oops";
}

export const initialPosts = [
  {
    title: "Test Post 1",
    content: "Test Content 1",
    tags: ["test", "example"],
  },
  {
    title: "Test Post 2",
    content: "Test Content 2",
    tags: ["testing", "deno"],
  },
  { title: "Test Post 3", content: "Test Content 3", tags: ["hello", "world"] },
];

export const initialComments = ["Awesome!", "Great post!"];

export const longComment =
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus";

export async function getFirstPost() {
  return await db.query.posts.findFirst();
}
