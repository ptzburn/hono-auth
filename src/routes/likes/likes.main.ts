import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./likes.routes.ts";
import * as handlers from "./likes.handlers.ts";

const likes = createRouter()
  .openapi(routes.getForPosts, handlers.getForPosts)
  .openapi(routes.createForPosts, handlers.createForPosts)
  .openapi(routes.getForComments, handlers.getForComments)
  .openapi(routes.createForComments, handlers.createForComments);

export default likes;
