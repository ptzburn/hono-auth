import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./comments.routes.ts";
import * as handlers from "./comments.handlers.ts";

const comments = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.get, handlers.get);

export default comments;
