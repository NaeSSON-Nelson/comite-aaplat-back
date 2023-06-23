import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Min,
  Max,
  IsDateString,
  IsIn,
  IsArray,
  IsInt,
  IsNotEmpty,
  Matches
} from 'class-validator';
import { patternDateFormat } from 'src/interfaces/validators';

export class CreateAfiliadoDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nombrePrimero: string;
  
  @IsString()
  @MinLength(2)
  @IsOptional()
  nombreSegundo?: string;
  
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  apellidoPrimero: string;
  
  @IsString()
  @MinLength(2)
  @IsOptional()
  apellidoSegundo?: string;
  
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  CI: string;
  
  @IsString()
  @IsNotEmpty()
  @IsIn(['masculino','femenino'])
  genero: string;
  
  @IsString()
  @MinLength(2)
  @IsOptional()
  profesion?: string;
  
  // @IsString()
  // @MinLength(2)
  // @IsOptional()
  // direccion?: string;
  
  @Matches(patternDateFormat,{
    message:'El patron de feches es: dd/mm/yyyy'
  })
  @IsNotEmpty()
  fechaNacimiento: Date;
  
  // @IsArray()
  // @IsOptional()
  // contactos?: string[];
  
  // @IsString()
  // @IsOptional()
  // urlFoto?: string;
  
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  estado: number;
}
