import EmailAlreadyException from "../exceptions/EmailAlreadyExistException";
import AddEmailDto from "./email.dto";
import Email from "./email.interface";
import IEmailRepository from "./emailRepository.interface";
import EmailNotFoundException from "../exceptions/EmailNotFoundException";

class EmailService {
  constructor(private readonly repository: IEmailRepository) {}

  public async addEmail(emailAdd: AddEmailDto): Promise<Email> {
    if (await this.repository.isEmailExist(emailAdd.email))
      throw new EmailAlreadyException(emailAdd.email);
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
}

export default EmailService;
