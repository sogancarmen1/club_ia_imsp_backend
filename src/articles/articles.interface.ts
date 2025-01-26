import { AddFileDto } from "./articles.dto";

interface Article {
  id: Number;
  title: string;
  contain: string;
  files: {
    url: string;
    type: string;
    orignal_name: string;
    files_names: string;
    size: number;
  }[];
}
export default Article;
