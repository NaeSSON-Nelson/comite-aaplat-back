import { Type } from 'class-transformer';
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
  Matches,
  IsEnum,
  IsDate
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
  
  @IsString()
  @IsIn(['mendez fortaleza','20 de marzo','san antonio','verde olivo','primavera',])
  barrio: string;
  
  
  @IsNotEmpty()
  @IsDate()
  @Type(()=>Date)
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
