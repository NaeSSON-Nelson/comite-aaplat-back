import { PartialType } from '@nestjs/mapped-types';
import { CreateMedidorAsociadoDto } from './create-medidor-asociado.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Estado } from 'src/interfaces/enum/enum-entityes';

export class UpdateMedidorAsociadoDto extends PartialType(CreateMedidorAsociadoDto) {

}
