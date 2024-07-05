import { Type } from 'class-transformer';
import {
    IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Barrio, Estado } from 'src/interfaces/enum/enum-entityes';
class AfiliadoForm {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  id: number;
}
class MedidorForm {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  id: number;
}
class UbicacionForm{
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
}
export class CreateMedidorAsociadoDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fechaInstalacion: Date;

  /// UBICACION GEOGRAFICA
  
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => UbicacionForm)
  ubicacion:UbicacionForm;
  // FIN

  @IsString()
  @MinLength(1)
  estadoMedidorAsociado:string

  @IsNotEmpty()
  @IsBoolean()
  registrable:boolean;
  
  @IsEnum(Estado)
  @IsNotEmpty()
  estado:Estado;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => AfiliadoForm)
  afiliado: AfiliadoForm;
  
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => MedidorForm)
  medidor: MedidorForm;
}
