interface ISendMail {
  sendMailTo(
    userEmail: string,
    subject: string,
    lien: string,
    textButton: string,
    text: string
  ): Promise<void>;
  contactUs(
    userEmail: string,
    subject: string,
    yourName: string,
    message: string
  ): Promise<void>;
}
export default ISendMail;
