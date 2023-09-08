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
  ValidateNested,
} from 'class-validator';
import { patternDateFormat } from 'src/interfaces/validators';
import { Afiliado } from '../../auth/modules/usuarios/entities/afiliado.entity';
import { Barrio, Estado } from 'src/interfaces/enum/enum-entityes';
export class AfiliadoForm{
  @IsNumber()
  @Min(1)
  id:number;
}
export class CreateMedidorDto {
  @IsString()
  @MinLength(4)
  nroMedidor: string;

  @IsNotEmpty()
  @IsDate()
  @Type(()=>Date)
  fechaInstalacion: Date;

  @IsString()
  @IsEnum(Barrio)
  barrio: Barrio;

  @IsString()
  @IsOptional()
  numeroVivienda?: string;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsNumber()
  @IsOptional()
  latitud?: number;
  
  @IsInt()
  @Min(0)
  lecturaInicial: number;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

  @IsString()
  @MinLength(1)
  marca: string;

  @ValidateNested()
  @Type(() => AfiliadoForm)
  afiliado: AfiliadoForm;
}
