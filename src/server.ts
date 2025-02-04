import "dotenv/config";
import App from "./app";
import ArticlesController from "./articles/articles.controller";
import NewslettersController from "./newsletters/newsletters.controller";
import AuthentificationController from "./authentification/authentification.controller";
import UserController from "./users/user.controller";

const app = new App([
  new ArticlesController(),
  new UserController(),
  new NewslettersController(),
  new AuthentificationController(),
]);
app.listen();
