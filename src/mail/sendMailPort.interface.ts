interface ISendMail {
  sendMailTo(
    userEmail: string,
    subject: string,
    message: string
  ): Promise<void>;
  contactUs(
    userEmail: string,
    subject: string,
    yourName: string,
    message: string
  ): Promise<void>;
}
export default ISendMail;
