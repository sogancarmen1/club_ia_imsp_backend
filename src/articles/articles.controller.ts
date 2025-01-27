import Controller from "interfaces/controllers.interface";
import expres from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { AddFileDto, CreateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import upload from "../config/saveFilesInDiskServer/multer.config";

class ArticlesController implements Controller {
  public path = "/article";
  public router = expres.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path,
      upload.array("media"),
      validateDto(CreateArticleDto),
      this.createArticle
    );
  }

  private createArticle = async (req: expres.Request, res: expres.Response) => {
    try {
      const article: CreateArticleDto = req.body;
      if (Array.isArray(req.files) && req.files.length > 0) {
        const files: AddFileDto[] = this.buildFilesUrl(req);

        const newArticle = await this.articleService.createArticle(
          article,
          files
        );
        res
          .status(201)
          .send(
            new Result(
              true,
              `Article ${newArticle.title} is created!`,
              newArticle
            )
          );
      } else {
        const newArticle = await this.articleService.createArticle(article);
        res
          .status(201)
          .send(
            new Result(
              true,
              `Article ${newArticle.title} is created!`,
              newArticle
            )
          );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private buildFilesUrl(req): AddFileDto[] {
    try {
      return req.files.map((file) => {
        return {
          url: `${req.protocol}://${req.get("host")}/images/${file.originalname
            .replace(/\s+/g, "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/'/g, "")}`,
          type: file.mimetype,
          orignal_name: file.originalname
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/'/g, ""),
          files_names: file.filename
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/'/g, ""),
          size: file.size,
        };
      });
    } catch {}
  }
}

export default ArticlesController;
