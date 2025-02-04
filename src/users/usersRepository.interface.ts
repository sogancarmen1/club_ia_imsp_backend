import AddEmailDto from "email/email.dto";
import { Users } from "./user.interface";
import { UpdateUserAccountDto } from "./user.dto";
import Email from "email/email.interface";

interface IUserRepository {
  createUser(
    email: string,
    role: string,
    passwordHashed?: string,
    state?: string
  ): Promise<Users>;
  deleteUser(userId: string): Promise<void>;
  getAllUserEditor(): Promise<Users[] | []>;
  updateMyAccount(
    userId: string,
    valueUpdated: UpdateUserAccountDto,
    state: string
  ): Promise<Users>;
  getUserByEmail(email: string): Promise<Users>;
  getUserById(userId: string): Promise<Users>;
  getAllEmail(): Promise<Email[] | []>;
}

export default IUserRepository;
