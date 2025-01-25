import "dotenv/config";
import App from "./app";
import ArticlesController from "./articles/articles.controller";

const app = new App([new ArticlesController()]);
app.listen();
