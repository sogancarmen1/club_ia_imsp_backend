import Article from "./articles.interface";
import IArticlesRepository from "./articlesRepository.interface";
import { AddFileDto, CreateArticleDto } from "./articles.dto";
import ArticleAlreadyException from "../exceptions/ArticleAlreadyExistException";
import ArticleNotFoundException from "../exceptions/ArticleNotFoundException";

class ArticleService {
  constructor(private readonly repository: IArticlesRepository) {}

  public async checkIfArticleTitleAlreadyExist(title: string): Promise<void> {
    const articleExist: boolean =
      await this.repository.isArticleFoundByTitleExist(title);
    if (articleExist) throw new ArticleAlreadyException(title);
  }

  public async createArticle(
    newArticle: CreateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article> {
    await this.checkIfArticleTitleAlreadyExist(newArticle.title);
    if (files) return await this.repository.createArticle(newArticle, files);
    else return await this.repository.createArticle(newArticle);
  }

  public async getArticleById(articleId: string): Promise<Article> {
    const articleFoundById = await this.repository.getArticleById(articleId);
    if (!articleFoundById) throw new ArticleNotFoundException(articleId);
    return articleFoundById;
  }

  public async getAllArticle(): Promise<Article[] | []> {
    return await this.repository.getAllArticles();
  }

  public async deleteArticle(articleId: string) {
    const articleFoundById = await this.getArticleById(articleId);
    await this.repository.deleteArticle(String(articleFoundById.id));
  }
}

export default ArticleService;
