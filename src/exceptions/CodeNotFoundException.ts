import HttpException from "./HttpException";

class CodeNotFoundException extends HttpException {
  constructor(code: string) {
    super(404, `Code ${code} not found!`);
  }
}

export default CodeNotFoundException;
