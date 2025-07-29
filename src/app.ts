import createApp from "./lib/create-app.ts";
import configureOpenApi from "./lib/configure-open-api.ts";
import main from "./routes/main.routes.ts";

const app = createApp();

const routes = [
  main,
];

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
