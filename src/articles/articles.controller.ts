import Controller from "interfaces/controllers.interface";
import express from "express";
import ArticleService from "./articles.service";
import PostgresArticlesRepository from "./postgresArticles.repository";
import { validateDto } from "../middlewares/validation.middleware";
import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import upload from "../config/saveFilesInDiskServer/multer.config";
import { authMiddleware } from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";
import path from "path";
import fs from "fs";

class ArticlesController implements Controller {
  public paths = "/articles";
  public router = express.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.paths}/medias`, this.getLengthOfAllMedias);
    /**
     * @swagger
     * /articles:
     *   post:
     *     tags:
     *       - Articles
     *     consumes:
     *       - multipart/form-data
     *     summary: Create a new article
     *     operationId: "createArticle"
     *     requestBody:
     *       description: name and description are REQUIRED but files is OPTIONNAL.
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/CreateArticle'
     *     responses:
     *       '201':
     *         description: project created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Articles'
     *       '401':
     *         description: Authorization information is missing or invalid.
     * components:
     *   schemas:
     *     CreateArticle:
     *       type: object
     *       properties:
     *         title:
     *           type: string
     *           example: "write a document"
     *         contain:
     *           type: string
     *           example: "write a contain of document"
     *         media:
     *           type: array
     *           items:
     *             type: string
     *             format: binary
     */
    this.router.post(
      this.paths,
      upload.array("media"),
      validateDto(CreateArticleDto),
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.createArticle
    );

    /**
     * @swagger
     * /articles/{id}:
     *    put:
     *      tags:
     *        - Articles
     *      consumes:
     *        - multipart/form-data
     *      summary: Updating an existing article
     *      operationId: "updateArticleInformation"
     *      parameters:
     *        - name: id
     *          in: path
     *          description: Article ID
     *          required: true
     *          schema:
     *            type: integer
     *            format: int64
     *      requestBody:
     *        description: name and description are REQUIRED but files is OPTIONNAL.
     *        required: true
     *        content:
     *          multipart/form-data:
     *            schema:
     *              $ref: '#/components/schemas/CreateArticle'
     *      responses:
     *        '200':
     *          description: successfull operation
     *          content:
     *            application/json:
     *              schema:
     *                $ref: '#/components/schemas/Articles'
     *        '400':
     *          description: Invalid ID supplied
     *        '404':
     *          description: Project not found
     *        '405':
     *          description: Validation exception
     */
    this.router.put(
      `${this.paths}/:id`,
      upload.array("media"),
      validateDto(UpdateArticleDto),
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.updateArticleInformation
    );

    /**
     * @swagger
     * tags:
     *   - name: Articles
     *     description: Operations about articles
     * /articles:
     *   get:
     *     tags:
     *       - Articles
     *     summary: Returns the list of articles
     *     operationId: "getAllArticles"
     *     responses:
     *       '200':
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Articles'
     *       '401':
     *         description: Authorization information is missing or invalid.
     * components:
     *   schemas:
     *     Articles:
     *       type: object
     *       properties:
     *         sucess:
     *               type: boolean
     *               example: true
     *         message:
     *               type: string
     *               example: "the message"
     *         data:
     *             type: array
     *             items:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   format: int64
     *                   example: 2
     *                 title:
     *                   type: string
     *                   example: MyArticle
     *                 contain:
     *                   type: string
     *                   example: Contain of MyArticle
     *                 files:
     *                   type: object
     *                   properties:
     *                     url:
     *                      type: string
     *                      example: http://localhost:3000/images/myImage.png
     *                     type:
     *                      type: string
     *                      example: image/png
     *                     original_name:
     *                      type: string
     *                      example: original_name
     *                     files_names:
     *                      type: string
     *                      example: original_name formated
     *                     size:
     *                      type: integer
     *                      format: int64
     *                      example: 2535
     */
    this.router.get(`${this.paths}/:type`, this.getAllArticlesOrProjects);

    /**
     * @swagger
     * /articles/{id}:
     *   get:
     *     tags:
     *       - Articles
     *     summary: Find article by ID
     *     operationId: "getArticleById"
     *     parameters:
     *       - name: id
     *         in: path
     *         description: Article ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       '200':
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Articles'
     *       '400':
     *         description: Invalid ID supplied
     *       '404':
     *         description: Article not found
     */
    this.router.get(`${this.paths}/by/:id`, this.getArticleById);

    /**
     * @swagger
     * /articles/{id}:
     *   delete:
     *     tags:
     *       - Articles
     *     summary: Delete a article
     *     operationId: "deleteArticle"
     *     parameters:
     *       - name: id
     *         in: path
     *         description: Article ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       '204':
     *         description: OK
     *       '400':
     *         description: Invalid ID supplied
     *       '404':
     *         description: Article not found
     */
    this.router.delete(
      `${this.paths}/:id`,
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.deleteArticle
    );

    /**
     * @swagger
     * /articles/{id}/medias:
     *   delete:
     *     tags:
     *       - Medias
     *     summary: Delete all medias in Article
     *     operationId: "deleteAllMedias"
     *     parameters:
     *       - name: id
     *         in: path
     *         description: Article ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       '204':
     *         description: OK
     *       '400':
     *         description: Invalid ID supplied
     *       '404':
     *         description: Article not found
     */
    this.router.delete(
      `${this.paths}/:id/medias`,
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.deleteAllMedias
    );

    /**
     * @swagger
     * /articles/{id}/medias/{mediasid}:
     *   delete:
     *     tags:
     *       - Medias
     *     summary: Delete a media in Article
     *     operationId: "deleteAMediasInArticle"
     *     parameters:
     *       - name: id
     *         in: path
     *         description: Article ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - name: mediasid
     *         in: path
     *         description: Media ID
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       '204':
     *         description: OK
     *       '400':
     *         description: Invalid ID supplied
     *       '404':
     *         description: Article not found
     */
    this.router.delete(
      `${this.paths}/:id/medias/:mediasid`,
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.deleteAMediasInArticle
    );
  }

  private getLengthOfAllMedias = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const lengthOfMedias = await this.articleService.getLenghtOfAllMedias();
      res
        .status(201)
        .send(new Result(true, `Length of all medias`, lengthOfMedias));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

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
      if (Array.isArray(req.files) && req.files.length > 0) {
        const files: AddFileDto[] = this.buildFilesUrl(req);

        const newArticle = await this.articleService.updateArticleInformation(
          req.params.id,
          articleInfo,
          files
        );
        res
          .status(201)
          .send(
            new Result(
              true,
              `Article with id ${req.params.id} is updated!`,
              newArticle
            )
          );
      } else {
        const articleUpdated =
          await this.articleService.updateArticleInformation(
            req.params.id,
            articleInfo
          );
        res.status(201).send(new Result(true, "All updated", articleUpdated));
      }
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

  private getAllArticlesOrProjects = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const allArticles = await this.articleService.getAllArticleOrProjects(
        req.params.type
      );
      res
        .status(201)
        .send(new Result(true, `All ${req.params.type}`, allArticles));
    } catch (error) {
      console.log(error);
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
          url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          type: file.mimetype,
          original_name: "",
          files_names: "",
          size: file.size,
        };
      });
    } catch {}
  }
}

export default ArticlesController;
