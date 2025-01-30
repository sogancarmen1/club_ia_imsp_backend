import Article from "./articles.interface";
import IArticlesRepository from "./articlesRepository.interface";
import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
import ArticleAlreadyExistException from "../exceptions/ArticleAlreadyExistException";
import ArticleNotFoundException from "../exceptions/ArticleNotFoundException";

class ArticleService {
  constructor(private readonly repository: IArticlesRepository) {}

  public async checkIfArticleTitleAlreadyExist(title: string): Promise<void> {
    const articleExist: boolean =
      await this.repository.isArticleFoundByTitleExist(title);
    if (articleExist) throw new ArticleAlreadyExistException(title);
  }

  public async updateArticleInformation(
    articleId: string,
    article: UpdateArticleDto
  ): Promise<Article> {
    await this.ArticleNotFound(articleId);
    const articleExistingWithTitle =
      await this.repository.isArticleFoundByTitleExist(article.title);
    if (articleExistingWithTitle)
      throw new ArticleAlreadyExistException(article.title);
    const articleUpdated = await this.repository.updateArticleInformation(
      articleId,
      article
    );
    return articleUpdated;
  }

  private async ArticleNotFound(articleId: string) {
    const articleExist = await this.repository.getArticleById(articleId);
    if (!articleExist) throw new ArticleNotFoundException(articleId);
  }

  public async deleteFileInArticle(
    articleId: string,
    fileId: string
  ): Promise<void> {
    await this.ArticleNotFound(articleId);
    await this.repository.deleteAFileInArticle(articleId, fileId);
  }

  public async deleteAllFilesInArticle(articleId: string): Promise<void> {
    await this.ArticleNotFound(articleId);
    await this.repository.deleteAllFilesInArticle(articleId);
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
