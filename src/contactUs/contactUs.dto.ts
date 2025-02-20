import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ContactUsDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;
  @IsString()
  @IsNotEmpty()
  public subject: string;
  @IsString()
  @IsNotEmpty()
  public message: string;
}
