interface ISendMail {
  sendMailTo(
    userEmail: string,
    subject: string,
    message: string
  ): Promise<void>;
}
export default ISendMail;
