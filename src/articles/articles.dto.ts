import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  public title: string;
  @IsString()
  @IsNotEmpty()
  public contain: string;
  @IsString()
  @IsNotEmpty()
  @IsIn(["article", "project"], {
    message: 'Type must be either "article" or "project"',
  })
  public type: string;
}

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  public title?: string;
  @IsString()
  @IsOptional()
  public contain?: string;
}

export class AddFileDto {
  public url: string;
  public type: string;
  public original_name: string;
  public files_names: string;
  public size: number;
}
