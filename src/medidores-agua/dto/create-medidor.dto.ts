import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Estado, Medicion } from 'src/interfaces/enum/enum-entityes';

export class CreateMedidorDto {
  @IsString()
  @MinLength(4)
  nroMedidor: string;
  @IsInt()
  @Min(0)
  lecturaInicial: number;
  
  @IsEnum(Medicion)
  medicion:Medicion;

  @IsString()
  @MinLength(1)
  marca: string;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

}
