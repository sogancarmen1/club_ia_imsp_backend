import { Pool, QueryResult } from "pg";
import { AddFileDto, CreateArticleDto, UpdateArticleDto } from "./articles.dto";
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
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  private convertRowToArticle(
    rowArticleCreated: any,
    rowAddFilesToArticle?: any
  ): Article {
    const article: Article = {
      id: rowArticleCreated.id,
      title: rowArticleCreated.title,
      contain: rowArticleCreated.contain,
      type: rowArticleCreated.type,
      date_publication: rowArticleCreated.date_publication.toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      ),
      files: rowAddFilesToArticle
        ? rowAddFilesToArticle.map((file) => {
            return {
              id: file.id,
              url: file.url,
              type: file.type,
              original_name: file.original_name,
              files_names: file.files_names,
              size: file.size,
            };
          })
        : [],
    };

    return article;
  }

  private convertRowToFiles(rowFilesFound: any): AddFileDto[] {
    const files: AddFileDto[] = rowFilesFound.map((file) => {
      return {
        id: file.id,
        url: file.url,
        type: file.type,
        original_name: file.original_name,
        files_names: file.files_names,
        size: file.size,
      };
    });
    return files;
  }

  public async updateDate(articleId: string): Promise<void> {
    try {
      await this.pool.query(
        "UPDATE articles.informations SET date_update = $1, WHERE id = $2;",
        [new Date(), articleId]
      );
    } catch (error) {}
  }

  public async deleteAllFilesInArticle(articleId: string): Promise<void> {
    try {
      await this.pool.query(
        "DELETE FROM articles.medias WHERE id_informations = $1",
        [articleId]
      );
    } catch (error) {}
  }

  public async deleteAFileInArticle(
    articleId: string,
    fileId: string
  ): Promise<string> {
    try {
      const result = await this.pool.query(
        "DELETE FROM articles.medias WHERE id_informations = $1 AND id = $2 RETURNING files_names;",
        [articleId, fileId]
      );
      return result.rows[0].files_names;
    } catch (error) {}
  }

  public async updateArticleInformation(
    articleId: string,
    article: UpdateArticleDto,
    files?: AddFileDto[]
  ): Promise<Article> {
    try {
      const result = await this.pool.query(
        "UPDATE articles.informations SET title = $1, contain = $2, date_update = $3 WHERE id = $4 RETURNING * ",
        [article.title, article.contain, new Date(), articleId]
      );
      if (files) {
        const addFileToArticleDto = this.convertAddFileDtoToString(
          files,
          Number(result.rows[0].id)
        );
        await this.insertionOfFilesAddToArticleInDatabase(addFileToArticleDto);
        const result2 =
          await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
            articleId,
            "medias",
            "id_informations"
          );
        return this.convertRowToArticle(result.rows[0], result2.rows);
      }
      const result2 =
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
          articleId,
          "medias",
          "id_informations"
        );
      return this.convertRowToArticle(result.rows[0], result2.rows);
    } catch (error) {}
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
      const result =
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
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
      const result =
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
          filename,
          "medias",
          "original_name"
        );
      if (result.rowCount != 0) return true;
      return false;
    } catch (error) {}
  }

  public async getNumberOfAllMedias(): Promise<Number> {
    try {
      const result = await this.pool.query("select * from articles.medias;");
      return result.rowCount;
    } catch (error) {}
  }

  private async getInformationsOrMediasBytitleOrOriginalNameOrId(
    informationsOrMedias: string,
    table: string,
    fields: string
  ): Promise<QueryResult> {
    return await this.pool.query(
      `SELECT * FROM articles.${table} WHERE ${fields} = $1`,
      [informationsOrMedias]
    );
  }

  public async deleteArticle(articleId: string): Promise<void> {
    try {
      if (
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
          articleId,
          "medias",
          "id_informations"
        )
      ) {
        await this.pool.query(
          `WITH mediasDeleted AS 
          (DELETE FROM articles.medias WHERE id_informations = $1 RETURNING id_informations) 
          DELETE FROM articles.informations WHERE id IN (SELECT id_informations FROM mediasDeleted)`,
          [articleId]
        );
      }
      await this.pool.query(`DELETE FROM articles.informations WHERE id = $1`, [
        articleId,
      ]);
    } catch (error) {}
  }

  public async getArticleById(articleId: string): Promise<Article | null> {
    try {
      const articleInformations =
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
          articleId,
          "informations",
          "id"
        );
      if (!articleInformations) return null;
      const articleMedias =
        await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
          articleInformations.rows[0].id,
          "medias",
          "id_informations"
        );
      return this.convertRowToArticle(
        articleInformations.rows[0],
        articleMedias.rows
      );
    } catch (error) {
      console.log(error);
    }
  }

  public async getAllArticlesOrProjects(type: string): Promise<Article[] | []> {
    try {
      const resultInformations = await this.pool.query(
        "SELECT * FROM articles.informations WHERE type = $1;",
        [type]
      );
      if (resultInformations.rowCount == 0) return [];
      let allArticle: Article[] = [];
      for (let i = 0; i < resultInformations.rows.length; i++) {
        allArticle.push({
          id: resultInformations.rows[i].id,
          title: resultInformations.rows[i].title,
          contain: resultInformations.rows[i].contain,
          type: resultInformations.rows[i].type,
          date_publication: resultInformations.rows[
            i
          ].date_publication.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          files: this.convertRowToFiles(
            (
              await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
                resultInformations.rows[i].id,
                "medias",
                "id_informations"
              )
            ).rows
              ? (
                  await this.getInformationsOrMediasBytitleOrOriginalNameOrId(
                    resultInformations.rows[i].id,
                    "medias",
                    "id_informations"
                  )
                ).rows
              : []
          ),
        });
      }
      return allArticle;
    } catch (error) {}
  }

  private async insertionOfFilesAddToArticleInDatabase(
    addFileToArticleDto: string
  ) {
    try {
      const result = await this.pool.query(
        "INSERT INTO articles.medias(url, type, original_name, files_names, size, id_informations) VALUES " +
          `${addFileToArticleDto}` +
          "  RETURNING *;"
      );
      return result;
    } catch (error) {}
  }

  private async insertArticleInDatabase(article: CreateArticleDto) {
    try {
      return await this.pool.query(
        "INSERT INTO articles.informations(title, contain, date_publication, date_update, type) VALUES ($1, $2, $3, $4, $5) returning id, title, contain, date_publication, date_update, type;",
        [article.title, article.contain, new Date(), new Date(), article.type]
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
          `('${file.url}', '${file.type}', '${file.original_name}', '${file.files_names}', ${file.size}, ${idArticle})`
      )
      .join(", ");
  }
}

export default PostgresArticlesRepository;
