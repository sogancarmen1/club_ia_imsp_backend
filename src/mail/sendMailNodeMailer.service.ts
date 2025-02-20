import nodemailer, { Transporter } from "nodemailer";
import ISendMail from "./sendMailPort.interface";
import Email from "email/email.interface";

class EmailSendNodeMailerService implements ISendMail {
  private transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private mailOptions(emails: string, subjects: string, texts: string) {
    const options = {
      from: `Club IA-IMSP ${process.env.EMAIL_USERNAME}`,
      to: emails,
      subject: subjects,
      text: texts,
    };
    return options;
  }

  private mailOptions2(
    email: string,
    subjects: string,
    yourName: string,
    texts: string
  ) {
    const options = {
      from: `${process.env.EMAIL_USERNAME}`,
      to: `${process.env.EMAIL_USERNAME}`,
      subject: `${yourName}, ${email}, ${subjects}`,
      text: texts,
    };
    return options;
  }

  public async contactUs(
    userEmail: string,
    yourName: string,
    subject: string,
    message: string
  ): Promise<void> {
    await this.transporter.sendMail(
      this.mailOptions2(userEmail, subject, yourName, message)
    );
  }

  public async sendMailTo(
    userEmail: string,
    message: string,
    subject: string
  ): Promise<void> {
    await this.transporter.sendMail(
      this.mailOptions(userEmail, subject, message)
    );
  }
}

export default EmailSendNodeMailerService;
