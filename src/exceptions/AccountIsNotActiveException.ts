import HttpException from "./HttpException";

class AccountIsNotActiveException extends HttpException {
  constructor(email: string) {
    super(400, `Account is inactive for user with email ${email}`);
  }
}

export default AccountIsNotActiveException;
