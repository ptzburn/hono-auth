import createApp from "./lib/create-app.ts";
import configureOpenApi from "./lib/configure-open-api.ts";
import main from "./routes/main.routes.ts";
import posts from "./routes/posts/posts.main.ts";
import comments from "./routes/comments/comments.main.ts";

const app = createApp();

const routes = [
  main,
  posts,
  //comments,
];

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
});

export default app;
