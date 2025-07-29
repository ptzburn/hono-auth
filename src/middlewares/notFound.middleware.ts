import type { NotFoundHandler } from "hono";

const notFound: NotFoundHandler = (c) => {
  // deno-lint-ignore no-console
  console.error(`An error occurred: path ${c.req.path} not found`);

  return c.json({
    success: false,
    message: `Not Found - ${c.req.path}`,
  }, 404);
};

export default notFound;
