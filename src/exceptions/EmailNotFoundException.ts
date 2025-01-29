import HttpException from "./HttpException";

class EmailNotFoundException extends HttpException {
  constructor(email: string) {
    super(404, `Email ${email} not found!`);
  }
}

export default EmailNotFoundException;
