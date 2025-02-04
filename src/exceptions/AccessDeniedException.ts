import HttpException from "./HttpException";

class AccessDenied extends HttpException {
  constructor() {
    super(404, `Access denied!`);
  }
}

export default AccessDenied;
