import { IsNotEmpty, IsString } from "class-validator";

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  public title: string;
  @IsString()
  @IsNotEmpty()
  public contain: string;
}

export class AddFileDto {
  public url: string;
  public type: string;
  public orignal_name: string;
  public files_names: string;
  public size: number;
}
