import { AddFileDto, CreateArticleDto } from "./articles.dto";
import Article from "./articles.interface";

interface IArticlesRepository {
  getArticleByTitle(title: string): Promise<Article | null>;
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
}

export default IArticlesRepository;
