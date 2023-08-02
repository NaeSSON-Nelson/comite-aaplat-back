import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNotEmptyObject } from 'class-validator';
import { Barrio, Estado } from 'src/interfaces/enum/enum-entityes';
import { Type } from 'class-transformer';

export class CreateAfiliadoDto {
  
  @IsEnum(Barrio)
  @IsNotEmpty()
  barrio: Barrio;

  @IsString()
  @IsOptional()
  nroVivienda?: string;

  @IsString()
  @IsOptional()
  longitud?: string;

  @IsString()
  @IsOptional()
  latitud?: string;
  @IsEnum(Estado)
  @IsOptional()
  estado?:Estado;
}
