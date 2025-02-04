import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class UpdateUserAccountDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  public email?: string;
  @IsOptional()
  @IsString()
  @IsStrongPassword()
  public password?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  public token: string;
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @IsStrongPassword()
  public password: string;
}
