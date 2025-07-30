import createApp from "./lib/create-app.ts";
import configureOpenApi from "./lib/configure-open-api.ts";
import main from "./routes/main.routes.ts";
import posts from "./routes/posts/posts.main.ts";

const app = createApp();

const routes = [
  main,
  posts,
];

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
});

export default app;
