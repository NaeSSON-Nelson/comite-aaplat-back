import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estado?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  menus?: number[];
}
