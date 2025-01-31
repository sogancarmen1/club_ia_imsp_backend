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
  public path = "/articles";
  public router = express.Router();
  private articleService = new ArticleService(new PostgresArticlesRepository());
  
  constructor() {
    this.initializeRoutes();
  }
  
  public initializeRoutes() {
    /**
     * @swagger
     * /articles:
     *   post:
     *     tags:
     *       - Articles
     *     summary: Create a new article
     *     operationId: "createArticle"
     *     requestBody:
     *       description: name and description are REQUIRED but files is OPTIONNAL.
     *       required: true
     *       content:
     *         application/json:
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
     *         files:
     *           type: array
     *           properties:
     *             url:
     *              type: string
     *              example: "the url"
     *             type:
     *              type: string
     *              example: "img/png"
     *             original_name:
     *              type: string
     *              example: "the original name"
     *             files_names:
     *              type: string
     *              example: "the files names"
     *             size:
     *              type: integer
     *              formt: int64
     *              example: 4352
     */
    this.router.post(
      this.path,
      upload.array("media"),
      validateDto(CreateArticleDto),
      this.createArticle
    );

    /**
     * @swagger
     * /articles/{id}:
     *    put:
     *      tags:
     *        - Articles
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
     *        description: name and contain are REQUIRED but description is OPTIONNAL.
     *        required: true
     *        content:
     *          application/json:
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
    this.router.put(`${this.path}/:id`, this.updateArticleInformation);


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
     *                      example: img/png
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
    this.router.get(this.path, this.getAllArticles);
    
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
    this.router.get(`${this.path}/:id`, this.getArticleById);


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
    this.router.delete(`${this.path}/:id`, this.deleteArticle);

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
    this.router.delete(`${this.path}/:id/medias`, this.deleteAllMedias);

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
