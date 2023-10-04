import { PartialType } from '@nestjs/mapped-types';
import { CreatePagosDeServicioDto } from './create-pagos-de-servicio.dto';

export class UpdatePagosDeServicioDto extends PartialType(CreatePagosDeServicioDto) {}
