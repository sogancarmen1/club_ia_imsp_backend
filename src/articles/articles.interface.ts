interface Article {
  id: Number;
  title: string;
  contain: string;
  files: {
    url: string;
    type: string;
    original_name: string;
    files_names: string;
    size: number;
  }[];
}
export default Article;
