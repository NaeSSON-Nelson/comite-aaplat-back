import { Type } from 'class-transformer';
import {
  IsDate,
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
import { Afiliado } from '../../auth/modules/usuarios/entities/afiliado.entity';
import { Barrio, Estado } from 'src/interfaces/enum/enum-entityes';

export class CreateMedidorDto {
  @IsString()
  @MinLength(4)
  nroMedidor: string;

  @IsDate()
  @IsNotEmpty()
  fechaInstalacion: Date;

  @IsString()
  @IsEnum(Barrio)
  barrio: Barrio;

  @IsInt()
  @Min(0)
  lecturaInicial: number;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

  @IsString()
  @MinLength(1)
  marca: string;

  @IsObject()
  @IsNotEmptyObject({})
  @Type(() => Afiliado)
  afiliado: Afiliado;
}
