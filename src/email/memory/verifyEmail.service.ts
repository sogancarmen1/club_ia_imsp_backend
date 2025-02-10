// import { IGenerateCode } from "generateCode/generateCode.interface";
// import {
//   IMemoryEmailRepository,
//   InfoCodeVerification,
// } from "./memoryEmail.interface";
// import ISendMail from "mail/sendMailPort.interface";
// import {AddEmailDto} from "../email.dto";
// import UserService from "users/user.service";
// import { Users } from "users/user.interface";
// import IUserRepository from "users/usersRepository.interface";
// import EmailAlreadyExistException from "../../exceptions/EmailAlreadyExistException";

// class VerifyEmailService {
//   constructor(
//     private readonly repositoryMemoryEmail: IMemoryEmailRepository,
//     private readonly generateCodeService: IGenerateCode,
//     private readonly smsService: ISendMail,
//     private readonly userService: UserService
//   ) {}

//   public async verifyEmail(dataVerify: AddEmailDto): Promise<string> {
//     const user = await this.userService.getUserByEmail(dataVerify);
//     if (user) throw new EmailAlreadyExistException(user.email);
//     const codeGeneratedForPhoneNumber = await this.generateCodeVerification(
//       dataVerify.email
//     );
//     await this.smsService.sendMailTo(
//       dataVerify.email,
//       `Your code validation is ${codeGeneratedForPhoneNumber}`,
//       "Confirm your email"
//     );
//     return codeGeneratedForPhoneNumber;
//   }

//   // public async validateCodeVerification(
//   //   dataEmail: string,
//   //   dataCode: codeVerificationDto
//   // ): Promise<Users> {
//   //   const dataFound: InfoCodeVerification | null =
//   //     this.repositoryMemoryEmail.getDataWhenPhoneNumberHasCode(
//   //       dataEmail,
//   //       dataCode.code
//   //     );
//   //   if (!dataFound) throw new CodeNotFoundException(dataCode.code);
//   //   this.repositoryMemoryEmail.deleteCodeVerification(dataFound.phoneNumber);
//   //   return await this.userService.addEmail({
//   //     email: dataEmail,
//   //   });
//   // }

//   private async generateCodeVerification(email: string): Promise<string> {
//     let codeGenerated: string = "";
//     let existingCodeCount: number = 0;
//     do {
//       codeGenerated = this.generateCodeService.getUniqueCodeGenerate();
//       existingCodeCount = this.verifyCodeGenerateIsUnique(codeGenerated);
//     } while (existingCodeCount > 0);
//     this.repositoryMemoryEmail.addCodeVerification(email, codeGenerated);
//     return codeGenerated;
//   }

//   private verifyCodeGenerateIsUnique(code: string): number {
//     let count: number = 0;
//     const allcodeGenerated =
//       this.repositoryMemoryEmail.getAllCodeVerification();
//     allcodeGenerated.forEach((value) => {
//       if (value == code) count++;
//     });
//     return count;
//   }
// }

// export default VerifyEmailService;
