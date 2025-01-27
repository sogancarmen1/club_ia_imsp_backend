import Article from "./articles.interface";
import IArticlesRepository from "./articlesRepository.interface";
import { AddFileDto, CreateArticleDto } from "./articles.dto";
import ArticleAlreadyException from "../exceptions/ArticleAlreadyExistException";

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
}

export default ArticleService;
