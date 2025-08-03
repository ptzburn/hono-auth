import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./comments.routes.ts";
import * as handlers from "./comments.handlers.ts";

const comments = createRouter()
  .openapi(routes.create, handlers.create);

export default comments;
