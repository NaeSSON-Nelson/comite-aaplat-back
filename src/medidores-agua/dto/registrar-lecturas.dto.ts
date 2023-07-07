import { IsArray, IsNotEmptyObject, IsObject } from 'class-validator';
import { LecturaMedidor } from '../entities/lectura-medidor.entity';
import { Type } from 'class-transformer';
import { CreateLecturaMedidorDto } from './create-lectura-medidor.dto';

export class RegistrarLecturasDto {
  @IsArray()
  @IsObject({ each: true })
  @IsNotEmptyObject({}, { each: true })
  @Type(() => CreateLecturaMedidorDto)
  lecturas: CreateLecturaMedidorDto[];
}
