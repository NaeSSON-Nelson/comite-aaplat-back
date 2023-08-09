import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Estado, Nivel } from 'src/interfaces/enum/enum-entityes';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nombre: string;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;
  
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  menus?: number[];
  
  @IsEnum(Nivel)
  @IsOptional()
  nivel:Nivel;
}
