import app from "./app.ts";
import env from "./env.ts";

const port = env.PORT;

Deno.serve({
  port,
  handler: app.fetch,
  onListen({ port }) {
    // deno-lint-ignore no-console
    console.log(`Server started at http://localhost:${port}`);
  },
});
