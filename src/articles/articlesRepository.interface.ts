import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
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
  getAllArticlesOrProjects(type: string): Promise<Article[] | []>;
  getArticleById(articleId: string): Promise<Article | null>;
  deleteArticle(articleId: string): Promise<void>;
  deleteAllFilesInArticle(articleId: string): Promise<void>;
  deleteAFileInArticle(articleId: string, fileId: string): Promise<string>;
  updateArticleInformation(
    articleId: string,
    article: UpdateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article>;
  updateDate(articleId: string): Promise<void>;
  getNumberOfAllMedias(): Promise<Number>;
}

export default IArticlesRepository;
