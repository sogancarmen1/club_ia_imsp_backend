import HttpException from "./HttpException";

class ArticleNotFoundException extends HttpException {
  constructor(articleId: string) {
    super(404, `Article with id ${articleId} not found!`);
  }
}

export default ArticleNotFoundException;
