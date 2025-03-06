import ISendMail from "mail/sendMailPort.interface";
import { SendNewlettersDto } from "./newsletters.dto";
import Email from "email/email.interface";
import UserService from "users/user.service";

class NewslettersService {
  constructor(
    private readonly emailSendService: ISendMail,
    private readonly userService: UserService
  ) {}

  public async sendNewsletters(message: SendNewlettersDto) {
    const allEmails = await this.userService.getAllEmail();
    if(allEmails.length !== 0) {
      await this.emailSendService.sendMailTo(this.convertAllEmailsToOneStringCharactere(allEmails), message.subject, message.link, message.textButton, message.text);
    }
  }

  private convertAllEmailsToOneStringCharactere(emails: Email[] | []): string {
    return emails.map((email: Email) => `${email.the_email}`).join(", ");
  }
}

export default NewslettersService;
