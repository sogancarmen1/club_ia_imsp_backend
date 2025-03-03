import bcrypt from "bcryptjs";
import { IHashPasswordService } from "./hashPasswordService.interface";

class HashPasswordBcryptService implements IHashPasswordService {
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  public async verifyPassword(
    password: string,
    passwordHashed: string
  ): Promise<boolean> {
    const isPasswordMatching = await bcrypt.compare(password, passwordHashed);
    if (isPasswordMatching) return true;
    return false;
  }
}

export default HashPasswordBcryptService;
