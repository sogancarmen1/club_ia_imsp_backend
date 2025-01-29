import { Router } from "express";
import Controller from "interfaces/controllers.interface";
import express from "express";
import NewslettersService from "./newsletters.service";
import EmailSendNodeMailerService from "../mail/sendMailNodeMailer.service";
import PostgresEmailRepository from "../email/postgresEmail.repository";
import validateDto from "../middlewares/validation.middleware";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import EmailService from "../email/email.service";
import { SendNewlettersDto } from "./newsletters.dto";

class NewslettersController implements Controller {
  public path: string = "/newsletter";
  public router: Router = express.Router();
  private newslettersService = new NewslettersService(
    new EmailSendNodeMailerService(),
    new EmailService(new PostgresEmailRepository())
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path,
      validateDto(SendNewlettersDto),
      this.sendNewLetters
    );

    this.router.delete(`${this.path}/:email`, this.unsubscriber);
  }

  private unsubscriber = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const email = req.params.email;
      await this.newslettersService.unsubscriber(email);
      res.status(204).send(new Result(true, "Email has delete!", null));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private sendNewLetters = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const letterInformations: SendNewlettersDto = req.body;
      await this.newslettersService.sendNewsletters(letterInformations);
      res.status(201).send(new Result(true, "New letters is sent!", null));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };
}

export default NewslettersController;
