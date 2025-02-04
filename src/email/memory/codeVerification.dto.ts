import { IsNotEmpty, IsString, Length } from "class-validator";

export class codeVerificationDto {
  @IsString()
  @Length(5, 5)
  @IsNotEmpty()
  public code: string;
}
