import HttpException from "./HttpException";

class ArticleAlreadyException extends HttpException {
  constructor(title: string) {
    super(400, `Article with title ${title} already exist!`);
  }
}

export default ArticleAlreadyException;
