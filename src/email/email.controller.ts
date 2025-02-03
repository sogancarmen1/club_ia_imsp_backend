import { Router } from "express";
import Controller from "interfaces/controllers.interface";
import express from "express";
import VerifyEmailService from "../email/verifyEmail.service";
import GenerateCodeNanoIdService from "../generateCode/generateCode.service";
import EmailSendNodeMailerService from "../mail/sendMailNodeMailer.service";
import PostgresEmailRepository from "../email/postgresEmail.repository";
import validateDto from "../middlewares/validation.middleware";
import AddEmailDto from "../email/email.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import { codeVerificationDto } from "./codeVerification.dto";
import EmailService from "./email.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import memoryEmailRepositoryInstance from "../email/memoryEmail.repository";
import Email from "./email.interface";

class EmailController implements Controller {
  public path: string = "/email";
  public router: Router = express.Router();
  private verifyEmailService = new VerifyEmailService(
    memoryEmailRepositoryInstance,
    new GenerateCodeNanoIdService(),
    new EmailSendNodeMailerService(),
    new PostgresEmailRepository()
  );
  private emailService = new EmailService(
    new PostgresEmailRepository(),
    memoryEmailRepositoryInstance
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    /**
     * @swagger
     * tags:
     *   - name: Emails
     *     description: Operations about emails
     * /email/verify:
     *   post:
     *     tags:
     *       - Emails
     *     summary: Verify email
     *     operationId: "verifyEmail"
     *     requestBody:
     *       description: email is REQUIRED.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AddEmail'
     *     responses:
     *       '201':
     *         description: code send to email
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EmailVerify'
     *       '401':
     *         description: Authorization information is missing or invalid.
     * /email/{email}:
     *   post:
     *     tags:
     *       - Emails
     *     summary: Validate email
     *     operationId: "validateEmail"
     *     parameters:
     *       - name: email
     *         in: path
     *         description: email
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       description: code is REQUIRED.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Code'
     *     responses:
     *       '201':
     *         description: email is validate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Email'
     *       '401':
     *         description: Authorization information is missing or invalid.
     * /email:
     *   get:
     *     tags:
     *       - Emails
     *     summary: Returns the list of emails
     *     operationId: "allEmail"
     *     responses:
     *       '200':
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Emails'
     *       '401':
     *         description: Authorization information is missing or invalid.
     * components:
     *   schemas:
     *     AddEmail:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           example: "example@example.com"
     *     EmailVerify:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           example: true
     *         message:
     *           type: string
     *           example: "the message"
     *         data:
     *           type: object
     *           properties:
     *             code:
     *               type: string
     *               example: "123456"
     *     Code:
     *       type: object
     *       properties:
     *         code:
     *           type: string
     *           example: "123456"
     *     EmailValidate:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           example: true
     *         message:
     *           type: string
     *           example: "the message"
     *         data:
     *           type: object
     *           properties:
     *             the_email:
     *               type: string
     *               example: "example@example.com"
     *             date_inscription:
     *               type: string
     *               format: date
     *               example: "2024-12-01"
     *     Emails:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           example: true
     *         message:
     *           type: string
     *           example: "the message"
     *         data:
     *           type: array
     *           items:
     *             type: object
     *             properties:
     *               the_email:
     *                 type: string
     *                 example: "example@example.com"
     *               date_inscription:
     *                 type: string
     *                 format: date
     *                 example: "2024-12-01"
     *     Email:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           example: true
     *         message:
     *           type: string
     *           example: "the message"
     *         data:
     *           type: object
     *           properties:
     *             the_email:
     *               type: string
     *               example: "example@example.com"
     *             date_inscription:
     *               type: string
     *               format: date
     *               example: "2024-12-01"
     */

    /**
     * @swagger
     * /email:
     *   post:
     *     tags:
     *       - Emails
     *     summary: add a new email
     *     operationId: "addEmail"
     *     requestBody:
     *       description: code is REQUIRED.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AddEmail'
     *     responses:
     *       '200':
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Emails'
     */

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
    this.router.get(this.path, authMiddleware, this.allEmail);
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

  private allEmail = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const allEmails = await this.emailService.getAllEmails();
      res.status(201).send(new Result(true, "All emails!", allEmails));
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
      const emailAdd: Email =
        await this.verifyEmailService.validateCodeVerification(
          queryEmail,
          code
        );
      res
        .status(201)
        .send(new Result(true, "Your mail is verified and store!", emailAdd));
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
