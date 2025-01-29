import { AddFileDto, CreateArticleDto } from "./articles.dto";
import Article from "./articles.interface";

interface IArticlesRepository {
  createArticle(
    newArticle: CreateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article>;
  isArticleFoundByTitleExist(title: string): Promise<boolean>;
  isFileFoundByFileNameExist(filename: string): Promise<boolean>;
  addFilesToArticle(
    article: CreateArticleDto,
    files: AddFileDto[]
  ): Promise<Article>;
  getAllArticles(): Promise<Article[] | []>;
  getArticleById(articleId: string): Promise<Article | null>;
  deleteArticle(articleId: string): Promise<void>;
}

export default IArticlesRepository;
