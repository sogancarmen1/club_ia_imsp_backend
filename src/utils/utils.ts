export class Result {
  sucess: boolean;
  message: string;
  data: any;
  constructor(sucess: boolean, message: string, data: any) {
    this.sucess = sucess;
    this.message = message;
    this.data = data;
  }
}
