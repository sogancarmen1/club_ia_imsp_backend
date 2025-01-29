export interface IHashPasswordService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, passwordHashed: string): Promise<boolean>;
}
