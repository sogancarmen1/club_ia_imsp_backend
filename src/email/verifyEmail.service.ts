import { IGenerateCode } from "generateCode/generateCode.interface";
import {
  IMemoryEmailRepository,
  InfoCodeVerification,
} from "./memoryEmail.interface";
import ISendMail from "mail/sendMailPort.interface";
import { codeVerificationDto } from "./codeVerification.dto";
import CodeNotFoundException from "../exceptions/CodeNotFoundException";
import AddEmailDto from "./email.dto";
import IEmailRepository from "./emailRepository.interface";
import Email from "./email.interface";
import EmailAlreadyExistException from "../exceptions/EmailAlreadyExistException";

class VerifyEmailService {
  constructor(
    private readonly repositoryMemoryEmail: IMemoryEmailRepository,
    private readonly generateCodeService: IGenerateCode,
    private readonly smsService: ISendMail,
    private readonly repositoryEmail: IEmailRepository
  ) {}

  public async verifyEmail(dataVerify: AddEmailDto): Promise<string> {
    const codeGeneratedForPhoneNumber = await this.generateCodeVerification(
      dataVerify.email
    );
    await this.smsService.sendMailTo(
      dataVerify.email,
      `Your code validation is ${codeGeneratedForPhoneNumber}`,
      "Confirm your email"
    );
    return codeGeneratedForPhoneNumber;
  }

  public async validateCodeVerification(
    dataEmail: string,
    dataCode: codeVerificationDto
  ): Promise<Email> {
    const dataFound: InfoCodeVerification | null =
      this.repositoryMemoryEmail.getDataWhenPhoneNumberHasCode(
        dataEmail,
        dataCode.code
      );
    if (!dataFound) throw new CodeNotFoundException(dataCode.code);
    this.repositoryMemoryEmail.deleteCodeVerification(dataFound.phoneNumber);
    const emailExist = await this.repositoryEmail.isEmailExist(dataEmail);
    if (emailExist) throw new EmailAlreadyExistException(dataEmail);
    const emailAdd = await this.repositoryEmail.addEmail({
      email: dataEmail,
    });
    return emailAdd;
  }

  private async generateCodeVerification(email: string): Promise<string> {
    await this.repositoryEmail.isEmailExist(email);
    let codeGenerated: string = "";
    let existingCodeCount: number = 0;
    do {
      codeGenerated = this.generateCodeService.getUniqueCodeGenerate();
      existingCodeCount = this.verifyCodeGenerateIsUnique(codeGenerated);
    } while (existingCodeCount > 0);
    this.repositoryMemoryEmail.addCodeVerification(email, codeGenerated);
    return codeGenerated;
  }

  private verifyCodeGenerateIsUnique(code: string): number {
    let count: number = 0;
    const allcodeGenerated =
      this.repositoryMemoryEmail.getAllCodeVerification();
    allcodeGenerated.forEach((value) => {
      if (value == code) count++;
    });
    return count;
  }
}

export default VerifyEmailService;
