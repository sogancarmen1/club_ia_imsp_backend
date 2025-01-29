import HttpException from "./HttpException";

class EmailAlreadyException extends HttpException {
  constructor(email: string) {
    super(400, `Email ${email} already exist!`);
  }
}

export default EmailAlreadyException;
