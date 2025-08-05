import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./comments.routes.ts";
import * as handlers from "./comments.handlers.ts";

const comments = createRouter()
  .openapi(routes.get, handlers.get)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove);

export default comments;
