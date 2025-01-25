import { CreateArticleDto } from "./articles.dto";
import Article from "./articles.interface";

interface IArticlesRepository {
  getArticleByTitle(title: string): Promise<Article | null>;
  createArticle(newArticle: CreateArticleDto): Promise<Article>;
  isArticleFoundByTitleExist(title: string): Promise<boolean>;
}

export default IArticlesRepository;
