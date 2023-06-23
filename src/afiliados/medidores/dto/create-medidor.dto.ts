import { Type } from 'class-transformer';
import {
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
import { Afiliado } from 'src/afiliados/entities/afiliado.entity';
import { patternDateFormat } from 'src/interfaces/validators';

export class CreateMedidorDto {
  @IsString()
  @MinLength(4)
  nroMedidor: string;

  @Matches(patternDateFormat, {
    message: 'El patron de feches es: dd/mm/yyyy',
  })
  @IsNotEmpty()
  fechaInstalacion: Date;

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
