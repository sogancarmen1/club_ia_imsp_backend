import EmailService from "email/email.service";
import { LoginDto } from "./login.dto";
import { IHashPasswordService } from "hashPassword/hashPasswordService.interface";
import DataStoredInToken from "token/dataStorageInToken.interface";
import jwt from "jsonwebtoken";
import TokenData from "token/token.interface";
import WrongCredentialsException from "../exceptions/WrongCredentialException";

class AuthentificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly hashPasswordService: IHashPasswordService
  ) {}

  public async loginAdmin(loginData: LoginDto) {
    const emailAdmin = await this.emailService.getAdmin(loginData.email);
    if (emailAdmin) {
      const isPasswordMatching = await this.hashPasswordService.verifyPassword(
        loginData.password,
        emailAdmin.password
      );
      if (isPasswordMatching) {
        const tokenData = this.createToken(loginData.email);
        const cookie = this.createCookie(tokenData);
        return cookie;
      } else throw new WrongCredentialsException();
    } else throw new WrongCredentialsException();
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; Path=/; HttpOnly; Max-Age=${tokenData.expiresIn}; SameSite=None; Secure=true; Partitioned`;
  }

  private createToken(emailAdmin: string): TokenData {
    const expireIn = 60 * 60;
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _email: emailAdmin,
    };
    return {
      expiresIn: expireIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn: expireIn }),
    };
  }
}

export default AuthentificationService;
