import { Pool } from "pg";
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
              files_size: file.size,
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
      if (files) {
        return this.addFilesToArticle(newArticle, files);
      } else {
        const articleCreated = await this.insertArticleInDatabase(newArticle);
        return this.convertRowToArticle(articleCreated.rows[0]);
      }
    } catch (error) {}
  }

  public async addFilesToArticle(
    article: CreateArticleDto,
    files: AddFileDto[]
  ): Promise<Article> {
    try {
      const resultInsertArticle = await this.insertArticleInDatabase(article);
      const addFileToArticleDto = this.convertAddFileDtoToString(
        files,
        Number(resultInsertArticle.rows[0].id)
      );
      const resultAddFilesToArticle =
        await this.insertionOfFilesAddToArticleInDatabase(addFileToArticleDto);
      return this.convertRowToArticle(
        resultInsertArticle.rows[0],
        resultAddFilesToArticle.rows
      );
    } catch (error) {}
  }

  public async isArticleFoundByTitleExist(title: string): Promise<boolean> {
    try {
      const result = await this.getInformationsOrMediasBytitleOrOriginalName(
        title,
        "informations",
        "title"
      );
      if (result.rowCount != 0) return true;
      return false;
    } catch (error) {}
  }

  public async isFileFoundByFileNameExist(filename: string): Promise<boolean> {
    try {
      const result = await this.getInformationsOrMediasBytitleOrOriginalName(
        filename,
        "medias",
        "orignal_name"
      );
      if (result.rowCount != 0) return true;
      return false;
    } catch (error) {}
  }

  private async getInformationsOrMediasBytitleOrOriginalName(
    informationsOrMedias: string,
    table: string,
    fields: string
  ) {
    return await this.pool.query(
      `SELECT * FROM articles.${table} WHERE ${fields} = $1`,
      [informationsOrMedias]
    );
  }

  private async insertionOfFilesAddToArticleInDatabase(
    addFileToArticleDto: string
  ) {
    try {
      const result = await this.pool.query(
        "INSERT INTO articles.medias(url, type, orignal_name, files_names, size, id_informations) VALUES " +
          `${addFileToArticleDto}` +
          "  RETURNING *;"
      );
      return result;
    } catch (error) {}
  }

  private async insertArticleInDatabase(article: CreateArticleDto) {
    try {
      return await this.pool.query(
        "INSERT INTO articles.informations(title, contain, date_publication, date_update) VALUES ($1, $2, $3, $4) returning id, title, contain, date_publication, date_update;",
        [article.title, article.contain, new Date(), new Date()]
      );
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
