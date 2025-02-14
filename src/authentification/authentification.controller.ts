import express, { Router } from "express";
import AuthentificationService from "./authentification.service";
import HashPasswordBcryptService from "../hashPassword/hashPasswordBcrypt.service";
import Controller from "interfaces/controllers.interface";
import validateDto from "../middlewares/validation.middleware";
import { LoginDto } from "./login.dto";
import { Result } from "../utils/utils";
import HttpException from "../exceptions/HttpException";
import UserService from "../users/user.service";
import PostgresUserRepository from "../users/postgresUser.repository";
import GenerateCodeNanoIdService from "../generateCode/generateCode.service";

class AuthentificationController implements Controller {
  public paths = "/auth";
  public router = express.Router();
  private authentificationService = new AuthentificationService(
    new HashPasswordBcryptService(),
    new PostgresUserRepository()
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    /**
     * @swagger
     * tags:
     *   - name: Authentification
     *     description: Operations about authentification
     */

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags:
     *       - Authentification
     *     summary: Logs in and returns the authentication  cookie
     *     operationId: "logginIn"
     *     requestBody:
     *       description: A JSON object containing the login and password.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       '200':
     *         description: >
     *           Successfully authenticated.
     *           The session ID is returned in a cookie named `JSESSIONID`. You need to include this cookie in subsequent requests.
     *       headers:
     *         Set-Cookies:
     *           schema:
     *             type: string
     *             example: Authorization=abcde12345; Path=/; HttpOnly
     *       '404':
     *          description: User not found
     * components:
     *   schemas:
     *     LoginRequest:
     *        type: object
     *        properties:
     *          email:
     *            type: string
     *            example: "myemail@gmail.com"
     *          password:
     *            type: string
     *            example: "njhfbrehfbsdh1*"
     *     securitySchemes:
     *       cookieAuth:
     *         type: apiKey
     *         in: cookie
     *         name: Authorization
     *
     * security:
     *   - cookieAuth: []
     */
    this.router.post(
      `${this.paths}/login`,
      validateDto(LoginDto),
      this.logginIn
    );

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     tags:
     *       - Authentification
     *     summary: Delete token in  cookie
     *     operationId: "loggingOut"
     *     responses:
     *       '200':
     *         description: OK
     */
    this.router.post(`${this.paths}/logout`, this.loggingOut);
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
      "Authorization=; Path=/; Max-Age=0; SameSite=None; Secure=true; Partitioned",
    ]);
    response.sendStatus(200);
  };
}

export default AuthentificationController;
