import { PartialType } from '@nestjs/mapped-types';
import { CreateMedidorDto } from './create-medidor.dto';

export class UpdateMedidorDto extends PartialType(CreateMedidorDto) {}
