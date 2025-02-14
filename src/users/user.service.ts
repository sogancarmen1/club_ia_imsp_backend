import { AddEmailDto } from "email/email.dto";
import IUserRepository from "./usersRepository.interface";
import EmailAlreadyExistException from "../exceptions/EmailAlreadyExistException";
import { Users } from "./user.interface";
import { IHashPasswordService } from "hashPassword/hashPasswordService.interface";
import { IGenerateCode } from "generateCode/generateCode.interface";
import Email from "email/email.interface";
import UserNotFoundException from "../exceptions/UserNotFoundException";
// import VerifyEmailService from "email/memory/verifyEmail.service";
import { ChangePasswordDto, UpdateUserAccountDto } from "./user.dto";
import PasswordIsNotNull from "exceptions/PasswordIsNotNullException";
import AuthentificationService from "../authentification/authentification.service";
import ISendMail from "../mail/sendMailPort.interface";
import { decodedToken } from "../middlewares/auth.middleware";
import AccessDenied from "../exceptions/AccessDeniedException";

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly generateCodeService: IGenerateCode,
    private readonly hashPasswordService: IHashPasswordService,
    private readonly authentificationService: AuthentificationService,
    private readonly sendMailService: ISendMail
  ) {}

  public async createEditor(email: AddEmailDto): Promise<Users> {
    await this.ConflictEmail(email);
    const codeGenerated = this.generateCodeService.getUniqueCodeGenerate();
    const codeGeneratedHashed = await this.hashPasswordService.hashPassword(
      codeGenerated
    );
    const user = await this.userRepository.createUser(
      email.email,
      "editor",
      codeGeneratedHashed,
      "inactive"
    );
    const token = this.authentificationService.createToken(user.id, user.role, user.email);
    await this.sendMailService.sendMailTo(
      user.email,
      `The url to activate your account : ${process.env.URL}/reset-password?token=${token.token}`,
      "Active your account"
    );
    return user;
  }

  public async receiveEmailWhenForgotPassword(
    email: AddEmailDto
  ): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) throw new UserNotFoundException();
    if (user.role == "user") throw new AccessDenied();
    const token = this.authentificationService.createToken(user.id, user.role, user.email);
    await this.sendMailService.sendMailTo(
      user.email,
      `The url to reset your password : ${process.env.URL}/reset-password?token=${token.token}`,
      "Active your account"
    );
  }

  public async getUserByEmail(email: AddEmailDto) {
    return await this.userRepository.getUserByEmail(email.email);
  }

  public async activeAccount(newPassword: ChangePasswordDto): Promise<Users> {
    const tokenDecoded = decodedToken(newPassword.token);
    const user = await this.getUserById(tokenDecoded?._id);
    if (user.role == "user") throw new AccessDenied();
    const passwordHashed = await this.hashPasswordService.hashPassword(
      newPassword.password
    );
    return await this.userRepository.updateMyAccount(
      user.id,
      { ...user, password: passwordHashed },
      "active"
    );
  }

  public async addEmail(email: AddEmailDto): Promise<Users> {
    await this.ConflictEmail(email);
    return this.userRepository.createUser(email.email, "user");
  }

  public async getAllEmail(): Promise<Email[] | []> {
    return await this.userRepository.getAllEmail();
  }

  public async deleteUser(userId: string): Promise<void> {
    await this.UserNotFound(userId);
    await this.userRepository.deleteUser(userId);
  }

  public async getAllUserEditor(): Promise<Users[] | []> {
    return await this.userRepository.getAllUserEditor();
  }

  public async getUserById(userId: string) {
    return await this.UserNotFound(userId);
  }

  private async UserNotFound(userId: string) {
    const userFound = await this.userRepository.getUserById(userId);
    if (!userFound) throw new UserNotFoundException();
    return userFound;
  }

  public async ConflictEmail(email: AddEmailDto) {
    const emailUser = await this.userRepository.getUserByEmail(email.email);
    if (emailUser) throw new EmailAlreadyExistException(email.email);
    return emailUser;
  }
}

export default UserService;
