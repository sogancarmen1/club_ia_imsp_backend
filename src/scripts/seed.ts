import { Pool } from "pg";
import * as dotenv from "dotenv";
import HashPasswordBcryptService from "../hashPassword/hashPasswordBcrypt.service";
import EmailAlreadyExistException from "../exceptions/EmailAlreadyExistException";
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

    console.log("Executing SQL script to create ADMIN...");
    if (!process.env.ADMIN_PASSWORD)
      throw new Error("Admin password not entered");
    const passwordHashed = await bcryptService.hashPassword(
      process.env.ADMIN_PASSWORD
    );
    await client.query(
      `
        INSERT INTO subscriber(email, date_inscription, password) 
            VALUES ($1, $2, $3);
        `,
      [process.env.ADMIN_EMAIL, new Date(), passwordHashed]
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
