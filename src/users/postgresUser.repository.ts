import { Pool } from "pg";
import IUserRepository from "./usersRepository.interface";
import { Users } from "./user.interface";
import { AddEmailDto } from "email/email.dto";
import { UpdateUserAccountDto } from "./user.dto";
import Email from "email/email.interface";

class PostgresUserRepository implements IUserRepository {
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

  private convertRowToUser(rowUser: any): Users {
    return {
      id: rowUser.id,
      email: rowUser.email,
      data_inscription: rowUser.date_inscription.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      role: rowUser.role,
      state: rowUser.state,
      password: rowUser.password,
    };
  }

  private convertRowToEmail(rowEmailCreated: any): Email {
    return {
      the_email: rowEmailCreated.email,
      date_inscription: rowEmailCreated.date_inscription,
    };
  }

  public async getAllEmail(): Promise<Email[] | []> {
    try {
      const results = await this.pool.query(
        "SELECT * FROM subscriber WHERE password IS NULL;"
      );
      if (results) {
        const emails: Email[] = results.rows.map((result) => {
          return this.convertRowToEmail(result);
        });
        return emails;
      }
      return [];
    } catch (error) {}
  }

  public async deleteEmail(email: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM subscriber WHERE email = $1", [email]);
    } catch (error) {}
  }

  public async getUserByEmail(email: string): Promise<Users> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM subscriber WHERE email = $1;",
        [email]
      );
      return this.convertRowToUser(result.rows[0]);
    } catch (error) {}
  }

  public async getUserById(userId: string): Promise<Users> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM subscriber WHERE id = $1;",
        [userId]
      );
      return this.convertRowToUser(result.rows[0]);
    } catch (error) {}
  }

  public async createUser(
    email: string,
    role: string,
    passwordHashed?: string,
    state?: string
  ): Promise<Users> {
    try {
      const result = await this.pool.query(
        `
        INSERT INTO subscriber(email, date_inscription, password, role, state) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `,
        [email, new Date(), passwordHashed, role, state]
      );
      return this.convertRowToUser(result.rows[0]);
    } catch (error) {}
  }

  public async deleteUser(userId: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM subscriber WHERE id = $1", [userId]);
    } catch (error) {}
  }

  public async getAllUserEditor(): Promise<Users[] | []> {
    try {
      const results = await this.pool.query(
        "SELECT * FROM subscriber WHERE role = $1",
        ["editor"]
      );
      if (results.rowCount == 0) return [];
      return results.rows.map((result) => {
        return this.convertRowToUser(result);
      });
    } catch (error) {}
  }

  public async updateMyAccount(
    userId: string,
    valueUpdated: UpdateUserAccountDto,
    state: string
  ): Promise<Users> {
    try {
      const result = await this.pool.query(
        "UPDATE subscriber SET email = $1, password = $2, state = $3 WHERE id = $4 RETURNING *",
        [valueUpdated.email, valueUpdated.password, state, userId]
      );
      return this.convertRowToUser(result.rows[0]);
    } catch (error) {
      console.log(error);
    }
  }
}

export default PostgresUserRepository;
