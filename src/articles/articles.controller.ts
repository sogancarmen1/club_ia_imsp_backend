import Controller from "interfaces/controllers.interface";
import expres from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { CreateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import upload from "../config/saveFilesInDiskServer/multer.config";
import { Pool } from "pg";

class ArticlesController implements Controller {
  public path = "/articles";
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
      validateDto(CreateArticleDto),
      this.createArticle
    );
    // this.router.post(
    //   `${this.path}/upload/`,
    //   upload.single("media"),
    //   this.uploadFiles
    // );
    this.router.post(
      `${this.path}/upload/`,
      upload.single("media"),
      this.uploadFiles
    );
  }

  private createArticle = async (req: expres.Request, res: expres.Response) => {
    try {
      const article: CreateArticleDto = req.body;
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
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  // private uploadFiles = async (req, res: expres.Response) => {
  //   const mediaUrl = req.file.location;

  //   try {
  //     const result = await this.pool.query(
  //       "INSERT INTO articles.medias (url , type, orignal_name, files_names, size , id_informations) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
  //       [mediaUrl, "", "", "", 12, 1]
  //     );
  //     res.status(201).json(result.rows[0]);
  //   } catch (err) {
  //     console.error(err);
  //     res
  //       .status(500)
  //       .json({ error: "Erreur lors de la création de l'article" });
  //   }
  // };

  private uploadFiles = async (req, res) => {
    // if (!req.file) {
    //   return res.status(400).json({ error: "Aucun fichier uploadé" });
    // }

    try {
      console.log(req.file);
      const fileUrl = `${req.protocol}://${req.get(
        "host"
      )}/images/${req.file.originalname.replace(/\s+/g, "")}`;
      const result = await this.pool.query(
        "INSERT INTO articles.medias (url, type, orignal_name, files_names, size, id_informations) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [fileUrl, req.file.mimetype, req.file.originalname, "first", 4, 1]
      );
      res.status(201).send(result.rows[0]);
    } catch (err) {
      // console.error(err);
      // res
      //   .status(500)
      //   .json({ error: "Erreur lors de la création de l'article" });
    }
  };
}

export default ArticlesController;
