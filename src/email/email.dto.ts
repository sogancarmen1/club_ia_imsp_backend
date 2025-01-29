import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AddEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public email: string;
}

export default AddEmailDto;
