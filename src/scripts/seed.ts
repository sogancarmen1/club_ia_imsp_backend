import { Pool } from "pg";
import * as dotenv from "dotenv";
import HashPasswordBcryptService from "../hashPassword/hashPasswordBcrypt.service";
import EmailAlreadyException from "../exceptions/EmailAlreadyExistException";
dotenv.config();

async function initializeDatabase() {
  const bcryptService = new HashPasswordBcryptService();
  const client = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });

  try {
    console.log("Connecting to the database...");
    await client.connect();

    console.log("Executing SQL script to create SUPER ADMIN...");
    const resultOfVerification = await client.query(
      "SELECT * FROM subscriber WHERE email = $1",
      [process.env.ADMIN_EMAIL]
    );
    if (resultOfVerification.rowCount != 0)
      throw new EmailAlreadyException(process.env.ADMIN_EMAIL);
    await client.query(
      `
        INSERT INTO subscriber(email, date_inscription, password) 
            VALUES ($1, $2, $3);
        `,
      [process.env.ADMIN_EMAIL, new Date(), process.env.ADMIN_PASSWORD]
    );
    const result = await client.query(
      `SELECT password FROM subscriber WHERE password IS NOT NULL;`
    );
    await client.query(
      `UPDATE subscriber SET password = $1 WHERE password IS NOT NULL;`,
      [await bcryptService.hashPassword(result.rows[0].password)]
    );

    console.log("Operation successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing the database:", error);
    process.exit(0);
  } finally {
    await client.end();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

initializeDatabase();
