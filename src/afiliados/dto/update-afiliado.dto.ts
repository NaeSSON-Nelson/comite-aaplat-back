import { PartialType } from '@nestjs/mapped-types';
import { CreateAfiliadoDto } from './create-afiliado.dto';

export class UpdateAfiliadoDto extends PartialType(CreateAfiliadoDto) {}
