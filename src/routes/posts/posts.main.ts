import { createRouter } from "../../lib/create-app.ts";
import * as postsRoutes from "./posts.routes.ts";
import * as postsHandlers from "./posts.handlers.ts";

const posts = createRouter()
  .openapi(postsRoutes.getAllPosts, postsHandlers.allPosts)
  .openapi(postsRoutes.create, postsHandlers.createPost);

export default posts;
