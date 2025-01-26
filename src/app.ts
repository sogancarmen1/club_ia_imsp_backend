import express from "express";
import Controller from "./interfaces/controllers.interface";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import cors from "cors";


class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[]) {
    this.app = express();
    dotenv.config;
    this.port = Number(process.env.PORT);

    this.initializeMiddleware();
    this.initializeErrorHanlding();
    this.initializeControllers(controllers);
    this.connectToTheDataBase();
    this.initalizeStaticFiles();
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listen to port http://localhost:${this.port}`);
    });
  }

  private initializeMiddleware(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private initializeErrorHanlding(): void {
    this.app.use(errorMiddleware);
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private initalizeStaticFiles() {
    const uploadDir = path.join(
      __dirname,
      "src/config/saveFilesInDiskServer/images"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    this.app.use("/images", express.static(uploadDir));
  }

  private async connectToTheDataBase() {
    const {
      DB_USER,
      DB_PASSWORD,
      DB_HOST,
      DB_PORT,
      DB_DATABASE,
      PORT,
      JWT_SECRET,
    } = process.env;

    const pool = new Pool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    });

    try {
      await pool.connect();
      console.log("Connexion à la base de données réussie !");
    } catch (error) {
      console.error(
        "Erreur lors de la connexion à la base de données :",
        error
      );
    } finally {
      await pool.end();
    }
  }
}

export default App;
