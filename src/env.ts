import { z, ZodError } from "zod";

const EnvSchema = z.object({
  DENO_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  MAILGUN_API_KEY: z.string(),
  MAILGUN_DOMAIN: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

let env: env;

try {
  env = EnvSchema.parse(Deno.env.toObject());
} catch (e) {
  const error = e as ZodError;
  // deno-lint-ignore no-console
  console.error("❌ Invalid env:\n");
  for (const issue of error.issues) {
    // deno-lint-ignore no-console
    console.error(`* ${issue.path.join(".")}: ${issue.message}`);
  }
  Deno.exit(1);
}

export default env;
