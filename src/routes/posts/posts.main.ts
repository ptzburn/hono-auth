import { createRouter } from "../../lib/create-app.ts";
import * as postsRoutes from "./posts.routes.ts";
import * as postsHandlers from "./posts.handlers.ts";

const posts = createRouter()
  .openapi(postsRoutes.allPosts, postsHandlers.allPosts);

export default posts;
