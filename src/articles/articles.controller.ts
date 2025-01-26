import Controller from "interfaces/controllers.interface";
import expres from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { AddFileDto, CreateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import upload from "../config/saveFilesInDiskServer/multer.config";
import { Pool } from "pg";
import Article from "./articles.interface";

class ArticlesController implements Controller {
  public path = "/article";
  public router = expres.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());

  public pool: Pool;
  constructor() {
    this.initializeRoutes();

    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
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
      if (req.files && Array.isArray(req.files)) {
        const files: AddFileDto[] = req.files.map((file) => {
          return {
            url: `${req.protocol}://${req.get(
              "host"
            )}/images/${file.originalname
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
        console.log(files);

        const newArticle = await this.articleService.createArticle(
          article,
          files
        );
        console.log(newArticle);
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
      console.log(error);
      // if (error instanceof HttpException) {
      //   res.status(error.status).send(new Result(false, error.message, null));
      // } else {
      //   res.status(500).send(new Result(false, "Internal server error", null));
      // }
    }
  };
}

export default ArticlesController;
