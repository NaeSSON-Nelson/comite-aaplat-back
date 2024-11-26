import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNotEmptyObject, IsNumberString, IsNumber, Min, Length, MinLength, MaxLength } from 'class-validator';
import { Barrio, Estado, MetodoPago, Monedas } from 'src/interfaces/enum/enum-entityes';
import { Type } from 'class-transformer';

export class CreateAfiliadoDto {
  
  @IsEnum(Barrio)
  @IsNotEmpty()
  barrio: Barrio;

  @IsString()
  @IsOptional()
  numeroVivienda?: string;

  @IsNumberString()
  @IsOptional()
  longitud?: string;

  @IsNumberString()
  @IsOptional()
  latitud?: string;
  
  @IsEnum(Estado)
  @IsOptional()
  estado?:Estado;
  
  @IsNumber()
  @Min(0)
  monto:number;
  @IsEnum(Monedas)
  moneda:Monedas;
  @IsString()
  manzano:string;
  @IsNumber()
  @Min(1)
  numeroManzano:number;
  @Min(1)
  nroLote:number;

}
