import express, { Router } from "express";
import AuthentificationService from "./authentification.service";
import EmailService from "../email/email.service";
import HashPasswordBcryptService from "../hashPassword/hashPasswordBcrypt.service";
import PostgresEmailRepository from "../email/postgresEmail.repository";
import Controller from "interfaces/controllers.interface";
import validateDto from "../middlewares/validation.middleware";
import { LoginDto } from "./login.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";

class AuthentificationController implements Controller {
  public path = "/auth";
  public router = express.Router();
  private authentificationService = new AuthentificationService(
    new EmailService(new PostgresEmailRepository()),
    new HashPasswordBcryptService()
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/login`,
      validateDto(LoginDto),
      this.logginIn
    );

    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private logginIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const logInData: LoginDto = request.body;
      const cookie = await this.authentificationService.loginAdmin(logInData);
      response.setHeader("Set-Cookie", [cookie]);
      response.status(200).send(new Result(true, "you are connected", cookie));
    } catch (error) {
      if (error instanceof HttpException) {
        response
          .status(error.status)
          .send(new Result(false, error.message, null));
      } else {
        response
          .status(500)
          .send(new Result(false, "Internal server error", null));
      }
    }
  };

  private loggingOut = (
    request: express.Request,
    response: express.Response
  ) => {
    response.setHeader("Set-Cookie", [
      "Authorization=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
    ]);
    response.sendStatus(200);
  };
}

export default AuthentificationController;
