import * as bcrypt from "bcrypt";
import { IHashPasswordService } from "./hashPasswordService.interface";

class HashPasswordBcryptService implements IHashPasswordService {
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  public async verifyPassword(
    password: string,
    passwordHashed: string
  ): Promise<boolean> {
    return true;
  }
}

export default HashPasswordBcryptService;
