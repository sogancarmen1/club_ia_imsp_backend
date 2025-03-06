import Article from "./articles.interface";
import IArticlesRepository from "./articlesRepository.interface";
import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
import ArticleAlreadyExistException from "../exceptions/ArticleAlreadyExistException";
import ArticleNotFoundException from "../exceptions/ArticleNotFoundException";
import NewslettersService from "newsletters/newsletters.service";
import { SendNewlettersDto } from "newsletters/newsletters.dto";

class ArticleService {
  constructor(private readonly repository: IArticlesRepository,
             private readonly newsletterService: NewslettersService) {}

  public async getLenghtOfAllMedias(): Promise<Number> {
    return await this.repository.getNumberOfAllMedias();
  }

  public async checkIfArticleTitleAlreadyExist(title: string): Promise<void> {
    const articleExist: boolean =
      await this.repository.isArticleFoundByTitleExist(title);
    if (articleExist) throw new ArticleAlreadyExistException(title);
  }

  public async updateArticleInformation(
    articleId: string,
    article: UpdateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article> {
    await this.ArticleNotFound(articleId);
    const articleExistingWithTitle =
      await this.repository.isArticleFoundByTitleExist(article.title);
    if (articleExistingWithTitle)
      throw new ArticleAlreadyExistException(article.title);
    const articleFound = await this.repository.getArticleById(articleId);
    if (files) {
      if (article.title)
        return await this.repository.updateArticleInformation(
          articleId,
          {
            title: article.title,
            contain: articleFound.contain,
          },
          files
        );
      if (article.contain)
        return await this.repository.updateArticleInformation(
          articleId,
          {
            title: articleFound.title,
            contain: article.contain,
          },
          files
        );
      if (article.title && article.contain)
        return await this.repository.updateArticleInformation(
          articleId,
          {
            title: article.title,
            contain: article.contain,
          },
          files
        );
      return await this.repository.updateArticleInformation(
        articleId,
        {
          title: articleFound.title,
          contain: articleFound.contain,
        },
        articleFound.files
      );
    } else {
      if (article.title)
        return await this.repository.updateArticleInformation(articleId, {
          title: article.title,
          contain: articleFound.contain,
        });
      if (article.contain)
        return await this.repository.updateArticleInformation(articleId, {
          title: articleFound.title,
          contain: article.contain,
        });
      if (article.title && article.contain)
        return await this.repository.updateArticleInformation(articleId, {
          title: article.title,
          contain: article.contain,
        });
      return await this.repository.updateArticleInformation(articleId, {
        title: articleFound.title,
        contain: articleFound.contain,
      });
    }
  }

  private async ArticleNotFound(articleId: string) {
    const articleExist = await this.repository.getArticleById(articleId);
    if (!articleExist) throw new ArticleNotFoundException(articleId);
  }

  public async deleteFileInArticle(
    articleId: string,
    fileId: string
  ): Promise<string> {
    await this.ArticleNotFound(articleId);
    const fileDeleted = await this.repository.deleteAFileInArticle(
      articleId,
      fileId
    );
    await this.repository.updateDate(articleId);
    return fileDeleted;
  }

  public async deleteAllFilesInArticle(articleId: string): Promise<void> {
    await this.ArticleNotFound(articleId);
    await this.repository.deleteAllFilesInArticle(articleId);
    await this.repository.updateDate(articleId);
  }

  public async createArticle(
    newArticle: CreateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article> {
    const frontEndLink = process.env.URL.split(",")[0];

    await this.checkIfArticleTitleAlreadyExist(newArticle.title);
    if (files) {
      const articleCreatedWithFiles: Article =  await this.repository.createArticle(newArticle, files);
      const newsLettersInformations: SendNewlettersDto = {
         subject: "Nouvel article ajouté",
         link: articleCreatedWithFiles.type == "project" ?
          `${frontEndLink}/project/posts?lire=${articleCreatedWithFiles.id}-${articleCreatedWithFiles.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[#,',\s]+/g, "-").toLowerCase()}` :
          `${frontEndLink}/actualities/posts?lire=${articleCreatedWithFiles.id}-${articleCreatedWithFiles.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[#,',\s]+/g, "-").toLowerCase()}`,
         textButton: "Cliquer ici",
         text: `Titre de l'article : ${newArticle.title}`
       }
      await this.newsletterService.sendNewsletters(newsLettersInformations);
      return articleCreatedWithFiles;
    }
    else {
      const articleCreated: Article =  await this.repository.createArticle(newArticle);
       const newsLettersInformations: SendNewlettersDto = {
         subject: "Nouvel article ajouté",
         link: articleCreated.type == "project" ?
           `${frontEndLink}/project/posts?lire=${articleCreated.id}-${articleCreated.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[#,',\s]+/g, "-").toLowerCase()}` :
           `${frontEndLink}/actualities/posts?lire=${articleCreated.id}-${articleCreated.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[#,',\s]+/g, "-").toLowerCase()}`,
         textButton: "Cliquer ici",
         text: `Titre de l'article : ${newArticle.title}`
       }
      await this.newsletterService.sendNewsletters(newsLettersInformations);
      return articleCreated;
    }
  }

  public async getArticleById(articleId: string): Promise<Article> {
    const articleFoundById = await this.repository.getArticleById(articleId);
    if (!articleFoundById) throw new ArticleNotFoundException(articleId);
    return articleFoundById;
  }

  public async getAllArticleOrProjects(type: string): Promise<Article[] | []> {
    return await this.repository.getAllArticlesOrProjects(type);
  }

  public async deleteArticle(articleId: string) {
    const articleFoundById = await this.getArticleById(articleId);
    await this.repository.deleteArticle(String(articleFoundById.id));
  }
}

export default ArticleService;
