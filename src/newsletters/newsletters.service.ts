import ISendMail from "mail/sendMailPort.interface";
import { SendNewlettersDto } from "./newsletters.dto";
import EmailService from "email/email.service";
import Email from "email/email.interface";

class NewslettersService {
  constructor(
    private readonly emailSendService: ISendMail,
    private readonly emailService: EmailService
  ) {}

  public async sendNewsletters(message: SendNewlettersDto) {
    const allEmails = await this.emailService.getAllEmails();
    return await this.emailSendService.sendMailTo(
      this.convertAllEmailsToOneStringCharactere(allEmails),
      message.subject,
      message.message
    );
  }

  public async unsubscriber(email: string) {
    await this.emailService.deleteEmail(email);
  }

  private convertAllEmailsToOneStringCharactere(emails: Email[] | []): string {
    return emails.map((email: Email) => `${email.the_email}`).join(", ");
  }
}

export default NewslettersService;
