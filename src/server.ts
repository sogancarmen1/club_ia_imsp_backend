import "dotenv/config";
import App from "./app";
import ArticlesController from "./articles/articles.controller";
import EmailController from "./email/email.controller";
import NewslettersController from "./newsletters/newsletters.controller";
import AuthentificationController from "./authentification/authentification.controller";

const app = new App([
  new ArticlesController(),
  new EmailController(),
  new NewslettersController(),
  new AuthentificationController(),
]);
app.listen();
