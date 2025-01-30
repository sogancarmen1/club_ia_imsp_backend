import Controller from "interfaces/controllers.interface";
import express from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import upload from "../config/saveFilesInDiskServer/multer.config";

class ArticlesController implements Controller {
  public path = "/article";
  public router = express.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.put(`${this.path}/:id`, this.updateArticleInformation);

    this.router.post(
      this.path,
      upload.array("media"),
      validateDto(CreateArticleDto),
      this.createArticle
    );

    this.router.get(`${this.path}/:id`, this.getArticleById);
    this.router.get(this.path, this.getAllArticles);
    this.router.delete(`${this.path}/:id`, this.deleteArticle);
    this.router.delete(`${this.path}/:id/medias`, this.deleteAllMedias);
    this.router.delete(
      `${this.path}/:id/medias/:mediasid`,
      this.deleteAMediasInArticle
    );
  }

  private deleteAMediasInArticle = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      await this.articleService.deleteFileInArticle(
        req.params.id,
        req.params.mediasid
      );
      res
        .status(201)
        .send(
          new Result(
            true,
            `Medias with id ${req.params.mediasid} has deleted in article with id ${req.params.id}!`,
            null
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

  private deleteAllMedias = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      await this.articleService.deleteAllFilesInArticle(req.params.id);
      res
        .status(201)
        .send(
          new Result(
            true,
            `All medias in article ${req.params.id} has deleted`,
            null
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

  private updateArticleInformation = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const articleInfo: UpdateArticleDto = req.body;
      const articleUpdated = await this.articleService.updateArticleInformation(
        req.params.id,
        articleInfo
      );
      res.status(201).send(new Result(true, "All updated", articleUpdated));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private deleteArticle = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      await this.articleService.deleteArticle(req.params.id);
      res
        .status(201)
        .send(
          new Result(
            true,
            `Article with id ${req.params.id} has deleted!`,
            null
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

  private getAllArticles = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const allArticles = await this.articleService.getAllArticle();
      res.status(201).send(new Result(true, "All article", allArticles));
    } catch (error) {
      res.status(500).send(new Result(false, "Internal server error", null));
    }
  };

  private getArticleById = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const articleFoundById = await this.articleService.getArticleById(
        req.params.id
      );
      res.status(201).send(new Result(true, "Article found", articleFoundById));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private createArticle = async (
    req: express.Request,
    res: express.Response
  ) => {
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
          original_name: file.originalname
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
