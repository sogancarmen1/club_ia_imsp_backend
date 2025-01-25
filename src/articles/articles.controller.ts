import Controller from "interfaces/controllers.interface";
import expres from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { CreateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";

class ArticlesController implements Controller {
  public path = "/articles";
  public router = expres.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());
  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path,
      validateDto(CreateArticleDto),
      this.createArticle
    );
  }

  private createArticle = async (req: expres.Request, res: expres.Response) => {
    try {
      const article: CreateArticleDto = req.body;
      const newArticle = await this.articleService.createArticle(article);
      res
        .status(201)
        .send(
          new Result(true, `Article ${newArticle.title} is created!`, newArticle)
        );
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };
}

export default ArticlesController;
