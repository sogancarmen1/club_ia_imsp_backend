import HttpException from "./HttpException";

class PasswordIsNotNull extends HttpException {
  constructor() {
    super(404, `Password shouldn't be empty!`);
  }
}

export default PasswordIsNotNull;
