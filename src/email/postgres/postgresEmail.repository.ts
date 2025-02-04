// import { Pool } from "pg";
// import IEmailRepository from "./emailRepository.interface";
// import Email from "../email.interface";
// import AddEmailDto from "../email.dto";
// import { Users } from "users/user.interface";

// class PostgresEmailRepository implements IEmailRepository {
//   public pool: Pool;
//   constructor() {
//     this.pool = new Pool({
//       host: process.env.DB_HOST,
//       port: Number(process.env.DB_PORT),
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_DATABASE,
//     });
//   }

//   private convertRowToEmail(rowEmailCreated: any): Email {
//     return {
//       the_email: rowEmailCreated.email,
//       date_inscription: rowEmailCreated.date_inscription,
//     };
//   }

  

//   // public async getUser(): Promise<Users | null> {
//   //   try {
//   //     const result = await this.pool.query(
//   //       "SELECT * FROM subscriber WHERE password IS NOT NULL"
//   //     );
//   //     if (!result) return null;
//   //     return this.convertRowToAdminUser(result.rows[0]);
//   //   } catch (error) {}
//   // }

//   public async addEmail(emailAdd: AddEmailDto): Promise<Email> {
//     try {
//       const result = await this.pool.query(
//         `
//         INSERT INTO subscriber(email, date_inscription, role)
//         VALUES ($1, $2, $3) RETURNING *;
//         `,
//         [emailAdd.email, new Date(), "user"]
//       );
//       return this.convertRowToEmail(result.rows[0]);
//     } catch (error) {}
//   }

//   public async isEmailExist(email: string): Promise<boolean> {
//     try {
//       const emailFound = await this.getEmail(email);
//       if (emailFound) return true;
//       return false;
//     } catch (error) {}
//   }

//   public async getEmail(email: string): Promise<Email> {
//     try {
//       const result = await this.pool.query(
//         "SELECT * FROM subscriber WHERE email = $1;",
//         [email]
//       );
//       return this.convertRowToEmail(result.rows[0]);
//     } catch (error) {}
//   }

//   public async getAllEmail(): Promise<Email[] | []> {
//     try {
//       const results = await this.pool.query("SELECT * FROM subscriber;");
//       if (results) {
//         const emails: Email[] = results.rows.map((result) => {
//           return this.convertRowToEmail(result);
//         });
//         return emails;
//       }
//       return [];
//     } catch (error) {}
//   }

//   public async deleteEmail(email: string): Promise<void> {
//     try {
//       await this.pool.query("DELETE FROM subscriber WHERE email = $1", [email]);
//     } catch (error) {}
//   }
// }

// export default PostgresEmailRepository;
