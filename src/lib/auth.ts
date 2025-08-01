import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db.ts";
import { sendEmail } from "./email.ts";
import env from "../env.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: env.ENV !== "test",
  },
  emailVerification: {
    sendOnSignUp: env.ENV !== "test",
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  plugins: [
    openAPI({ disableDefaultReference: true }),
  ],
});
