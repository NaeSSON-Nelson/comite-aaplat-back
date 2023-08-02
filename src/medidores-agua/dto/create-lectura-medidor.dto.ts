import {
  IsEnum,
  IsInt,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Medidor } from '../entities/medidor.entity';
import { Type } from 'class-transformer';
import { Estado } from 'src/interfaces/enum/enum-entityes';

export class CreateLecturaMedidorDto {
  @IsInt()
  @Min(1)
  lectura: number;

  @IsString()
  @MinLength(5)
  @IsOptional()
  estadoMedidor?: string;
  
  
  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

  @IsObject()
  @IsNotEmptyObject({})
  @Type(() => Medidor)
  medidor: Medidor;
}
