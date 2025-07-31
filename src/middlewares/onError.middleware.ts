import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import env from "../env.ts";

const onError: ErrorHandler = (error, c) => {
  const currentStatus = "status" in error
    ? error.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== 200
    ? (currentStatus as ContentfulStatusCode)
    : 500;
  const environment = c.env.ENV || env.ENV;

  if (error instanceof HTTPException) {
    // deno-lint-ignore no-console
    console.error("HTTPException: ", error);
    return c.json({
      success: false,
      message: error.message,
      stack: environment === "production" ? undefined : error.stack,
    }, error.status);
  }

  if (error instanceof Error) {
    // deno-lint-ignore no-console
    console.error(error);
    return c.json({
      success: false,
      message: error.message,
      stack: environment === "production" ? undefined : error.stack,
    }, statusCode);
  }

  return c.json(
    { success: false, message: "An unknown error occurred" },
    500,
  );
};

export default onError;
