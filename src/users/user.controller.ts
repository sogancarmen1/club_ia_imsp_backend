import { Router } from "express";
import Controller from "interfaces/controllers.interface";
import express from "express";
import GenerateCodeNanoIdService from "../generateCode/generateCode.service";
import EmailSendNodeMailerService from "../mail/sendMailNodeMailer.service";
import validateDto from "../middlewares/validation.middleware";
import { AddEmailDto } from "../email/email.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
// import { codeVerificationDto } from "../email/memory/codeVerification.dto";
import UserService from "./user.service";
import PostgresUserRepository from "./postgresUser.repository";
import HashPasswordBcryptService from "../hashPassword/hashPasswordBcrypt.service";
import { Users } from "./user.interface";
import { ChangePasswordDto, UpdateUserAccountDto } from "./user.dto";
import { authMiddleware } from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";
import AuthentificationService from "../authentification/authentification.service";

class UserController implements Controller {
  public paths: string = "/user";
  public router: Router = express.Router();
  // private verifyEmailService = new VerifyEmailService(
  //   new GenerateCodeNanoIdService(),
  //   new EmailSendNodeMailerService(),
  //   new UserService(
  //     new PostgresUserRepository(),
  //     new GenerateCodeNanoIdService(),
  //     new HashPasswordBcryptService(),
  //     new AuthentificationService(
  //       new HashPasswordBcryptService(),
  //       new PostgresUserRepository()
  //     ),
  //     new EmailSendNodeMailerService()
  //   )
  // );
  private userService = new UserService(
    new PostgresUserRepository(),
    new GenerateCodeNanoIdService(),
    new HashPasswordBcryptService(),
    new AuthentificationService(
      new HashPasswordBcryptService(),
      new PostgresUserRepository()
    ),
    new EmailSendNodeMailerService()
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

    // this.router.post(
    //   `${this.paths}/verify`,
    //   validateDto(AddEmailDto),
    //   this.verifyEmail
    // );
    this.router.post(
      `${this.paths}/email`,
      validateDto(AddEmailDto),
      this.addEmail
    );
    // this.router.post(
    //   `${this.paths}/:email`,
    //   validateDto(codeVerificationDto),
    //   this.validateEmail
    // );
    this.router.get(
      this.paths,
      authMiddleware,
      authorizeRoles("admin", "editor"),
      this.allEmail
    );
    this.router.get(
      `${this.paths}/editor`,
      authMiddleware,
      authorizeRoles("admin"),
      this.getAllEditor
    );
    this.router.post(
      this.paths,
      validateDto(AddEmailDto),
      authMiddleware,
      authorizeRoles("admin"),
      this.createEditor
    );
    this.router.put(
      `${this.paths}/active`,
      validateDto(ChangePasswordDto),
      this.activeAccount
    );
    this.router.delete(
      `${this.paths}/:id`,
      authMiddleware,
      authorizeRoles("admin"),
      this.deleteUser
    );
    this.router.post(
      `${this.paths}/forgot-password`,
      validateDto(AddEmailDto),
      this.forgotPassword
    );
    this.router.get(`${this.paths}/:id`, authMiddleware, this.getUserById);
    this.router.get(
      `${this.paths}/by/:email`,
      authMiddleware,
      this.getUserByEmail
    );
  }

  private getUserByEmail = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const emailDto: AddEmailDto = {
        email: req.params.email.toString(),
      };
      const user = await this.userService.getUserByEmail(emailDto);
      res.status(200).send(new Result(true, "The user!", user));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private getUserById = async (req: express.Request, res: express.Response) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(201).send(new Result(true, "The user!", user));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private addEmail = async (req: express.Request, res: express.Response) => {
    try {
      const emailDto: AddEmailDto = req.body;
      await this.userService.addEmail(emailDto);
      res
        .status(201)
        .send(new Result(true, `Email ${emailDto.email} added!`, null));
    } catch (error) {
      // console.log(error);
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private getAllEditor = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const editors = await this.userService.getAllUserEditor();
      res.status(201).send(new Result(true, "All editors!", editors));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private forgotPassword = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const email: AddEmailDto = req.body;
      await this.userService.receiveEmailWhenForgotPassword(email);
      res.status(201).send(new Result(true, "Url is sent!", null));
    } catch (error) {
      // console.log(error);
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private deleteUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(201).send(new Result(true, "User has deleted", null));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private activeAccount = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const informations: ChangePasswordDto = req.body;
      await this.userService.activeAccount(informations);
      res.status(201).send(new Result(true, "Your account is active", null));
    } catch (error) {
      // console.log(error);
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  private createEditor = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const email: AddEmailDto = req.body;
      await this.userService.createEditor(email);
      res.status(201).send(new Result(true, "Url is sent!", null));
    } catch (error) {
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
      const allEmails = await this.userService.getAllEmail();
      res.status(201).send(new Result(true, "All emails!", allEmails));
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).send(new Result(false, error.message, null));
      } else {
        res.status(500).send(new Result(false, "Internal server error", null));
      }
    }
  };

  // private validateEmail = async (
  //   req: express.Request,
  //   res: express.Response
  // ) => {
  //   try {
  //     const queryEmail = req.params.email;
  //     const code: codeVerificationDto = req.body;
  //     const emailAdd: Users =
  //       await this.verifyEmailService.validateCodeVerification(
  //         queryEmail,
  //         code
  //       );
  //     res
  //       .status(201)
  //       .send(new Result(true, "Your mail is verified!", emailAdd));
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       res.status(error.status).send(new Result(false, error.message, null));
  //     } else {
  //       res.status(500).send(new Result(false, "Internal server error", null));
  //     }
  //   }
  // };

  // private verifyEmail = async (req: express.Request, res: express.Response) => {
  //   try {
  //     const email: AddEmailDto = req.body;
  //     const codeEmailGenerated = await this.verifyEmailService.verifyEmail(
  //       email
  //     );
  //     res
  //       .status(201)
  //       .send(new Result(true, "Code is sent!", codeEmailGenerated));
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       res.status(error.status).send(new Result(false, error.message, null));
  //     } else {
  //       res.status(500).send(new Result(false, "Internal server error", null));
  //     }
  //   }
  // };
}

export default UserController;
