import AddEmailDto from "./email.dto";
import Email from "./email.interface";

interface IEmailRepository {
  addEmail(email: AddEmailDto): Promise<Email>;
  deleteEmail(email: string): Promise<void>;
  isEmailExist(email: string): Promise<boolean>;
  getAllEmail(): Promise<Email[] | []>;
}

export default IEmailRepository;
