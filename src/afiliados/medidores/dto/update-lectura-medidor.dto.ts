import { PartialType } from '@nestjs/mapped-types';
import { CreateLecturaMedidorDto } from './create-lectura-medidor.dto';

export class UpdateLecturaMedidorDto extends PartialType(CreateLecturaMedidorDto) {}
