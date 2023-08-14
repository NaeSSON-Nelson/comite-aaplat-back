import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNotEmptyObject, IsNumberString, IsNumber } from 'class-validator';
import { Barrio, Estado } from 'src/interfaces/enum/enum-entityes';
import { Type } from 'class-transformer';

export class CreateAfiliadoDto {
  
  @IsEnum(Barrio)
  @IsNotEmpty()
  barrio: Barrio;

  @IsString()
  @IsOptional()
  numeroVivienda?: string;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsNumber()
  @IsOptional()
  latitud?: number;
  @IsEnum(Estado)
  @IsOptional()
  estado?:Estado;
}
