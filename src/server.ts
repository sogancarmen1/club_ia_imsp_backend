import "dotenv/config";
import App from "./app";
import ArticlesController from "./articles/articles.controller";
import EmailController from "./email/email.controller";
import NewslettersController from "./newsletters/newsletters.controller";

const app = new App([
  new ArticlesController(),
  new EmailController(),
  new NewslettersController(),
]);
app.listen();
