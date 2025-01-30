import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  public email: string;
  @IsNotEmpty()
  @IsString()
  public password: string;
}
