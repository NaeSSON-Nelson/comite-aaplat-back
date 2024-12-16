import { Type } from 'class-transformer';
import {
    IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Barrio, Estado, EstadoAsociacion } from 'src/interfaces/enum/enum-entityes';
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
  manzano:string;
  @IsNumber()
  @Min(1)
  numeroManzano:number;
  @Min(1)
  nroLote:number;
  
  @IsString()
  @IsOptional()
  numeroVivienda?: string;

  @IsNumberString()
  @IsOptional()
  longitud?: string;

  @IsNumberString()
  @IsOptional()
  latitud?: string;
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

  // @IsEnum(EstadoAsociacion)
  // estadoMedidorAsociado:EstadoAsociacion

  // @IsNotEmpty()
  // @IsBoolean()
  // registrable:boolean;
  
  @IsEnum(Estado)
  @IsOptional()
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
