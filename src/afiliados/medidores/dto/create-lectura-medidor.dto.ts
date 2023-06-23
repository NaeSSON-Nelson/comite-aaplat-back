import {
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

export class CreateLecturaMedidorDto {
  @IsInt()
  @Min(1)
  lectura: number;

  @IsString()
  @MinLength(5)
  @IsOptional()
  estadoMedidor?: string;
  
  @IsObject()
  @IsNotEmptyObject({})
  @Type(() => Medidor)
  medidor: Medidor;
}
