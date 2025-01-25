import { IsNotEmpty, IsString } from "class-validator";

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  public title: string;
  @IsString()
  @IsNotEmpty()
  public contain: string;
}
