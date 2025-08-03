import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";

export const posts = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar({ length: 500 }).notNull(),
  content: text().notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  viewsCount: integer().notNull().default(0),
  commentsCount: integer().notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(
    () => new Date(),
  ),
});

export const selectPostsSchema = createSelectSchema(posts, {
  id: (schema) => schema.describe("The unique identifier of the post"),
  userId: (schema) =>
    schema.describe("The unique identifier of the user who shared the post")
      .openapi({ example: "kQ2IvXmUtRXaHoUEQYnoh1mOf821XiOt" }),
  title: (schema) =>
    schema.describe("The title of the post").openapi({
      example: "Importance of documentation",
    }),
  content: (schema) =>
    schema.min(0).describe("The content of the post").openapi({
      example: "Learn how to properly document APIs...",
    }),
  tags: (schema) =>
    schema.describe("The tags of the post").openapi({
      example: ["documentation", "API", "TypeScript"],
    }),
  viewsCount: (schema) =>
    schema.min(0).max(9999).describe("The number of views under the post")
      .openapi({
        example: 0,
      }),
  commentsCount: (schema) =>
    schema.min(0).max(9999).describe("The number of comments under the post")
      .openapi({
        example: 0,
      }),
  imageUrl: (schema) =>
    schema.describe("The URL for the image in the post").openapi({
      example:
        "https://www.blog.com/api/images/f72cd425-476f-4599-bc8a-88135018905f",
    }),
  createdAt: z.iso.datetime().describe(
    "The date and time of the creation of the post",
  ),
  updatedAt: z.iso.datetime().describe(
    "The date and time of the latest updates of the post",
  ),
});

export const insertPostsSchema = createInsertSchema(posts, {
  title: (schema) =>
    schema.min(3, "Title must be at least 3 characters long").max(
      500,
      "The title is too long",
    ).describe("The title of the post").openapi({ example: "Hello blog!" }),
  content: (schema) =>
    schema.min(10, "Content must be at least 10 characters long").describe(
      "The content of the post",
    ).openapi({ example: "This is my first post" }),
  imageUrl: (schema) => schema.describe("The URL for the image in the post"),
  tags: (schema) =>
    schema.describe("The tags of the post").openapi({
      example: ["blog", "post"],
    }),
}).omit({
  id: true,
  userId: true,
  viewsCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePostsSchema = insertPostsSchema.partial();

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});
