import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';


export class CreateItemMenuDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(2)
  linkMenu: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estado?: number;
}
