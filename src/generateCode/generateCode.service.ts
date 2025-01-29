import { customAlphabet } from "nanoid";
import { IGenerateCode } from "./generateCode.interface";

class GenerateCodeNanoIdService implements IGenerateCode {
  constructor() {}

  getUniqueCodeGenerate(): string {
    const generateCode = customAlphabet("0123456789", 5);
    return generateCode();
  }
}

export default GenerateCodeNanoIdService;
