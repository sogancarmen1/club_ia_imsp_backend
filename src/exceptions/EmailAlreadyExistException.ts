import HttpException from "./HttpException";

class EmailAlreadyExistException extends HttpException {
  constructor(email: string) {
    super(400, `Email ${email} already exist!`);
  }
}

export default EmailAlreadyExistException;
