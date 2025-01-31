import EmailAlreadyExistException from "../exceptions/EmailAlreadyExistException";
import AddEmailDto from "./email.dto";
import Email from "./email.interface";
import IEmailRepository from "./emailRepository.interface";
import EmailNotFoundException from "../exceptions/EmailNotFoundException";
import { Users } from "authentification/user.interface";
import { IMemoryEmailRepository } from "./memoryEmail.interface";

class EmailService {
  constructor(
    private readonly repository: IEmailRepository,
    private readonly repositoryMemory: IMemoryEmailRepository
  ) {}

  public async addEmail(emailAdd: AddEmailDto): Promise<Email> {
    if (await this.repository.isEmailExist(emailAdd.email))
      throw new EmailAlreadyExistException(emailAdd.email);
    return await this.repository.addEmail(emailAdd);
  }

  public async deleteEmail(emailAdd: string): Promise<void> {
    if (!(await this.repository.isEmailExist(emailAdd)))
      throw new EmailNotFoundException(emailAdd);
    await this.repository.deleteEmail(emailAdd);
  }

  public async getAllEmails(): Promise<Email[] | []> {
    return await this.repository.getAllEmail();
  }

  public async getEmail(email: string): Promise<Email> {
    if (!(await this.repository.isEmailExist(email)))
      throw new EmailNotFoundException(email);
    return await this.repository.getEmail(email);
  }

  public async getAdmin(emailAdmin: string): Promise<Users | null> {
    if (!(await this.repository.isEmailExist(emailAdmin)))
      throw new EmailNotFoundException(emailAdmin);
    return this.repository.getAdmin();
  }
}

export default EmailService;
