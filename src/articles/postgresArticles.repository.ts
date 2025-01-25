import { Pool } from "pg";
import { CreateArticleDto } from "./articles.dto";
import Article from "./articles.interface";
import IArticlesRepository from "./articlesRepository.interface";

class PostgresArticlesRepository implements IArticlesRepository {
  public pool: Pool;
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }

  private convertRowToArticle(row: any) {
    const article: Article = {
      id: row.id,
      title: row.title,
      contain: row.contain,
    };
    return article;
  }

  async getArticleByTitle(title: string): Promise<Article | null> {
    return null;
  }

  public async createArticle(newArticle: CreateArticleDto): Promise<Article> {
    try {
      const articleCreated = await this.pool.query(
        "INSERT INTO articles.informations(title, contain, date_publication, date_update) VALUES ($1, $2, $3, $4) RETURNING *",
        [newArticle.title, newArticle.contain, new Date(), new Date()]
      );
      return this.convertRowToArticle(articleCreated.rows[0]);
    } catch (error) {}
  }

  public async isArticleFoundByTitleExist(title: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM articles.informations WHERE title = $1",
        [title]
      );
      if (result.rowCount != 0) return true;
      return false;
    } catch (error) {}
  }
}

export default PostgresArticlesRepository;
