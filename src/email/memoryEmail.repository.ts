import {
  InfoCodeVerification,
  IMemoryEmailRepository,
} from "./memoryEmail.interface";

class MemoryEmailRepository implements IMemoryEmailRepository {
  private codesSmsVerification: InfoCodeVerification[];
  private ADDITIONNALMINUTES: number = 10;
  constructor() {
    this.codesSmsVerification = [];
    if (this.getAllCodeVerification().length > 0) {
      setInterval(() => this.deleteAutomaticallyCodeVerification(), 60);
    }
  }

  public getDataWhenPhoneNumberHasCode(
    phoneNumber: string,
    code: string
  ): InfoCodeVerification | null {
    const dataFound: InfoCodeVerification | undefined =
      this.codesSmsVerification.find(
        (dataValue) =>
          dataValue.phoneNumber == phoneNumber && dataValue.code == code
      );
    if (!dataFound) return null;
    return dataFound;
  }

  public deleteAutomaticallyCodeVerification(): void {
    const now = new Date();
    this.codesSmsVerification = this.codesSmsVerification.filter(
      (value) => value.expiredAt > now
    );
  }

  public deleteCodeVerification(phoneNumber: string): void {
    const index: number = this.codesSmsVerification.findIndex(
      (value) => value.phoneNumber == phoneNumber
    );
    this.codesSmsVerification.splice(index, 1);
  }

  public addCodeVerification(
    phoneNumber: string,
    codeVerification: string
  ): InfoCodeVerification {
    const actualDate: Date = new Date();
    const value: InfoCodeVerification = {
      phoneNumber: phoneNumber,
      code: codeVerification,
      createdAt: actualDate,
      expiredAt: this.getExpireDate(actualDate),
    };
    this.codesSmsVerification.push(value);
    return value;
  }

  public getAllCodeVerification(): string[] {
    let allCodeVerification: string[] = [];
    this.codesSmsVerification.forEach((value) =>
      allCodeVerification.push(value.code)
    );
    return allCodeVerification;
  }

  private getExpireDate(actualDate: Date): Date {
    const expiredDate = new Date(
      actualDate.setUTCMinutes(
        actualDate.getUTCMinutes() + this.ADDITIONNALMINUTES
      )
    );
    return expiredDate;
  }
}

const memoryEmailRepositoryInstance = new MemoryEmailRepository();

export default memoryEmailRepositoryInstance;
