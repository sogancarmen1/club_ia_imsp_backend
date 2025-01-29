import { Router } from "express";
import Controller from "interfaces/controllers.interface";
import express from "express";
import VerifyEmailService from "../email/verifyEmail.service";
import MemoryEmailRepository from "../email/memoryEmail.repository";
import GenerateCodeNanoIdService from "../generateCode/generateCode.service";
import EmailSendNodeMailerService from "../mail/sendMailNodeMailer.service";
import PostgresEmailRepository from "../email/postgresEmail.repository";
import validateDto from "../middlewares/validation.middleware";
import AddEmailDto from "../email/email.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import { codeVerificationDto } from "./codeVerification.dto";
import EmailService from "./email.service";

class EmailController implements Controller {
  public path: string = "/email";
  public router: Router = express.Router();
  private verifyEmailService = new VerifyEmailService(
    new MemoryEmailRepository(),
    new GenerateCodeNanoIdService(),
    new EmailSendNodeMailerService(),
    new PostgresEmailRepository()
  );
  private emailService = new EmailService(new PostgresEmailRepository());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/verify`,
      validateDto(AddEmailDto),
      this.verifyEmail
    );
    this.router.post(this.path, validateDto(AddEmailDto), this.addEmail);
    this.router.post(
      `${this.path}/:email`,
      validateDto(codeVerificationDto),
      this.validateEmail
    );
    this.router.get(this.path, this.allEmail);
  }

  private addEmail = async (req: express.Request, res: express.Response) => {
    try {
      const emailDto: AddEmailDto = req.body;
      await this.emailService.addEmail(emailDto);
      res
        .status(201)
        .send(new Result(true, `Email ${emailDto.email} added!`, null));
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private allEmail = async (req: express.Request, res: express.Response) => {
    try {
      const allEmails = this.emailService.getAllEmails();
      res.status(201).send(new Result(true, "Newslettes is sent", allEmails));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private validateEmail = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const queryEmail = req.params.email;
      const code: codeVerificationDto = req.body;
      this.verifyEmailService.validateCodeVerification(queryEmail, code);
      res.status(201).send(new Result(true, "Your mail is verified!", null));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private verifyEmail = async (req: express.Request, res: express.Response) => {
    try {
      const email: AddEmailDto = req.body;
      const codeEmailGenerated = await this.verifyEmailService.verifyEmail(
        email
      );
      res
        .status(201)
        .send(new Result(true, "Code is sent!", codeEmailGenerated));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };
}

export default EmailController;
