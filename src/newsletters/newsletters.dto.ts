import { IsNotEmpty, IsString } from "class-validator";

export class SendNewlettersDto {
  @IsNotEmpty()
  @IsString()
  public subject: string;
  @IsNotEmpty()
  @IsString()
  public message: string;
}
