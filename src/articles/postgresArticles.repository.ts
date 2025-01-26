import { Pool, QueryResult } from "pg";
import { AddFileDto, CreateArticleDto } from "./articles.dto";
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

  private convertRowToArticle(
    rowArticleCreated: any,
    rowAddFilesToArticle?: any
  ) {
    const article: Article = {
      id: rowArticleCreated.id,
      title: rowArticleCreated.title,
      contain: rowArticleCreated.contain,
      files: rowAddFilesToArticle
        ? rowAddFilesToArticle.map((file) => {
            return {
              url: file.url,
              type: file.type,
              orignal_name: file.orignal_name,
              files_names: file.files_names,
              files_size: file.files_size,
            };
          })
        : [],
    };
    return article;
  }

  async getArticleByTitle(title: string): Promise<Article | null> {
    return null;
  }

  public async createArticle(
    newArticle: CreateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article> {
    try {
      let articleFiles: QueryResult<any>;
      let articleCreated: QueryResult<any>;
      if (!files) {
        articleCreated = await this.pool.query(
          "INSERT INTO articles.informations(title, contain, date_publication, date_update) VALUES ($1, $2, $3, $4) RETURNING *",
          [newArticle.title, newArticle.contain, new Date(), new Date()]
        );
        return this.convertRowToArticle(articleCreated.rows[0]);
      } else {
        articleCreated = await this.pool.query(
          "INSERT INTO articles.informations(title, contain, date_publication, date_update) VALUES ($1, $2, $3, $4) RETURNING *",
          [newArticle.title, newArticle.contain, new Date(), new Date()]
        );
        const addFileToArticleDto = this.convertAddFileDtoToString(
          files,
          Number(articleCreated.rows[0].id)
        );
        articleFiles = await this.pool.query(
          "INSERT INTO articles.medias(url, type, orignal_name, files_names, size, id_informations) VALUES " +
            `${addFileToArticleDto}` +
            " RETURNING *"
        );
        console.log(articleFiles);
        return this.convertRowToArticle(
          articleCreated.rows[0],
          articleFiles.rows
        );
      }
    } catch (error) {
      console.log(error);
    }
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

  public async isFileFoundByFileNameExist(filename: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM articles.medias WHERE orignal_name = $1",
        [filename]
      );
      if (result.rowCount != 0) return true;
      return false;
    } catch (error) {}
  }

  private convertAddFileDtoToString(
    addFileDto: AddFileDto[],
    idArticle: Number
  ) {
    return addFileDto
      .map(
        (file) =>
          `('${file.url}', '${file.type}', '${file.orignal_name}', '${file.files_names}', ${file.size}, ${idArticle})`
      )
      .join(", ");
  }
}

export default PostgresArticlesRepository;
