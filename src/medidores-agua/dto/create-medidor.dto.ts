import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { patternDateFormat } from 'src/interfaces/validators';
import { Afiliado } from '../../auth/modules/afiliados/entities/afiliado.entity';
import { Barrio } from 'src/interfaces/enum/Entities.enum';

export class CreateMedidorDto {
  @IsString()
  @MinLength(4)
  nroMedidor: string;

  @Matches(patternDateFormat, {
    message: 'El patron de feches es: dd/mm/yyyy',
  })
  @IsNotEmpty()
  fechaInstalacion: Date;

  @IsString()
  @IsEnum(Barrio)
  barrio: Barrio;

  @IsInt()
  @Min(0)
  lecturaInicial: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  estado?: number;

  @IsString()
  @MinLength(1)
  marca: string;

  @IsObject()
  @IsNotEmptyObject({})
  @Type(() => Afiliado)
  afiliado: Afiliado;
}
